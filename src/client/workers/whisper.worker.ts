import {
  pipeline,
  TextStreamer,
  type AutomaticSpeechRecognitionPipeline,
} from "@huggingface/transformers";
import type { TranscriptionResult, TranscriptionOptions } from "@/lib/types";
import {
  estimateAudioDuration,
  buildPipelineOptions,
} from "@/lib/transcription-utils";

export type { TranscriptionResult, TranscriptionOptions } from "@/lib/types";

// --- Message protocol ---

export type TimestampGranularity = "word" | "phrase";

export interface WorkerRequest {
  type: "init" | "transcribe" | "dispose";
  id?: string;
  modelId?: string;
  granularity?: TimestampGranularity;
  audio?: Float32Array;
  options?: TranscriptionOptions;
}

export interface WorkerResponseReady {
  type: "ready";
  device: "webgpu" | "wasm";
  modelId: string;
}

export interface WorkerResponseProgress {
  type: "progress";
  status: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

export interface WorkerResponseResult {
  type: "result";
  id: string;
  result: TranscriptionResult;
}

export interface WorkerResponseError {
  type: "error";
  id?: string;
  error: string;
}

export interface WorkerResponseStream {
  type: "stream";
  id: string;
  text: string;
}

export type WorkerResponse =
  | WorkerResponseReady
  | WorkerResponseProgress
  | WorkerResponseResult
  | WorkerResponseError
  | WorkerResponseStream;

function postResponse(response: WorkerResponse): void {
  self.postMessage(response);
}


let pipelinePromise: Promise<AutomaticSpeechRecognitionPipeline> | null = null;
let currentModelId: string | null = null;
let disposed = false;
let device: "webgpu" | "wasm";

/**
 * Models that fit in browser WASM memory (4GB hard limit, ~2-3GB effective).
 * whisper-medium exceeds this even at q4 due to encoder intermediate
 * activations (24 layers × float32 attention maps).
 */
const WASM_COMPATIBLE_MODELS = new Set([
  "Xenova/whisper-tiny.en",
  "Xenova/whisper-base.en",
  "onnx-community/whisper-base_timestamped",
  "Xenova/whisper-small.en",
]);

async function detectDevice(): Promise<"webgpu" | "wasm"> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gpu = (navigator as any).gpu;
    if (gpu) {
      const adapter = await gpu.requestAdapter();
      if (adapter) return "webgpu";
    }
  } catch {
    // WebGPU not available
  }
  return "wasm";
}

type DtypeValue = "fp16" | "q4" | "q8" | "fp32" | "int8" | "uint8" | "bnb4" | "q4f16" | "auto";
type DtypeConfig = DtypeValue | Record<string, DtypeValue>;

/**
 * Select optimal dtype based on model size and execution backend.
 *
 * - WebGPU has separate GPU memory, so medium models fit.
 *   Encoder is sensitive to quantization → fp16 for quality.
 *   Decoder tolerates aggressive quantization → q4 for speed.
 * - WASM is memory-constrained → q8 for small models.
 */
function getDtypeForModel(
  modelId: string,
  targetDevice: "webgpu" | "wasm",
): DtypeConfig {
  const isMedium = modelId.includes("medium");

  if (targetDevice === "webgpu") {
    return isMedium
      ? { encoder_model: "fp16" as DtypeValue, decoder_model_merged: "q4" as DtypeValue }
      : ("q4" as DtypeValue);
  }

  return "q8" as DtypeValue;
}

/**
 * Load (or reload) the Whisper pipeline with a specific model.
 */
async function initPipeline(modelId: string): Promise<AutomaticSpeechRecognitionPipeline> {
  if (disposed) {
    throw new Error("Transcriber has been disposed. Reload the page.");
  }

  // Switch model if needed
  if (pipelinePromise && currentModelId !== modelId) {
    console.log(`[whisper-worker] Switching model: ${currentModelId} → ${modelId}`);
    const old = await pipelinePromise;
    await old.dispose();
    pipelinePromise = null;
    currentModelId = null;
  }

  if (!pipelinePromise) {
    currentModelId = modelId;

    device = await detectDevice();

    // Validate model fits in WASM memory
    if (device === "wasm" && !WASM_COMPATIBLE_MODELS.has(modelId)) {
      throw new Error(
        `Model "${modelId}" is too large for browser WASM (4GB memory limit). ` +
        `WebGPU is required but not available in this browser. ` +
        `Use a smaller model (Small or below), or try Chrome/Edge with WebGPU support.`
      );
    }

    const dtype = getDtypeForModel(modelId, device);

    console.log(`[whisper-worker] Loading model: ${modelId} (device: ${device}, dtype: ${JSON.stringify(dtype)})`);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawPipeline = await (pipeline as any)("automatic-speech-recognition", modelId, {
        dtype,
        device,
        progress_callback: (info: {
          status: string;
          file?: string;
          progress?: number;
          loaded?: number;
          total?: number;
        }) => {
          postResponse({
            type: "progress",
            status: info.status,
            file: info.file,
            progress: info.progress,
            loaded: info.loaded,
            total: info.total,
          });
        },
      });

      pipelinePromise = Promise.resolve(rawPipeline as AutomaticSpeechRecognitionPipeline);
      console.log(`[whisper-worker] Model loaded: ${modelId}`);
      postResponse({ type: "ready", device, modelId });
    } catch (err) {
      pipelinePromise = null;
      currentModelId = null;
      throw err;
    }
  }

  return pipelinePromise;
}

/**
 * Transcribe audio using the loaded pipeline.
 */
async function transcribeAudio(
  id: string,
  modelId: string,
  granularity: TimestampGranularity,
  audioData: Float32Array,
  options: TranscriptionOptions = {},
): Promise<void> {
  try {
    const transcriber = await initPipeline(modelId);

    const duration = estimateAudioDuration(audioData);

    console.log(
      `[whisper-worker] Processing ${duration.toFixed(1)}s audio with model: ${modelId}`,
    );

    const fullOptions: TranscriptionOptions = {
      ...options,
      timestampGranularity: granularity,
    };

    const pipelineOptions = buildPipelineOptions(fullOptions, duration, modelId);
    
    // Crear el TextStreamer para capturar tokens en tiempo real
    const streamer = new TextStreamer(transcriber.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (token: string) => {
        postResponse({ type: "stream", id, text: token });
      },
    });

    const runtimeOptions = {
      ...pipelineOptions,
      streamer, // Inyectamos el streamer al pipeline
    };

    const result = await transcriber(
      audioData,
      runtimeOptions as Parameters<typeof transcriber>[1],
    );

    const output = Array.isArray(result) ? result[0] : result;

    const transcriptionResult: TranscriptionResult = {
      text: output.text.trim(),
      chunks: (output.chunks ?? []).map((chunk) => ({
        text: chunk.text,
        timestamp: chunk.timestamp as [number, number],
      })),
    };

    postResponse({ type: "result", id, result: transcriptionResult });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    console.error(`[whisper-worker] Transcription error: ${message}`);
    postResponse({ type: "error", id, error: message });
  }
}

/**
 * Dispose the pipeline and mark worker as disposed.
 */
async function disposePipeline(): Promise<void> {
  disposed = true;
  if (pipelinePromise) {
    const p = await pipelinePromise;
    await p.dispose();
    pipelinePromise = null;
    currentModelId = null;
    console.log("[whisper-worker] Pipeline disposed");
  }
}

// --- Message handler ---

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const { type, id, modelId, granularity, audio, options } = event.data;

  switch (type) {
    case "init": {
      if (!modelId) {
        postResponse({ type: "error", error: "init requires modelId" });
        return;
      }
      try {
        await initPipeline(modelId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to initialize";
        postResponse({ type: "error", error: message });
      }
      break;
    }

    case "transcribe": {
      if (!id || !audio || !modelId || !granularity) {
        postResponse({
          type: "error",
          id,
          error: "transcribe requires id, audio, modelId, and granularity",
        });
        return;
      }
      // audio is Float32Array — it's transferred (not copied) for zero overhead
      await transcribeAudio(id, modelId, granularity, audio, options);
      break;
    }

    case "dispose": {
      await disposePipeline();
      break;
    }

    default:
      postResponse({ type: "error", error: `Unknown message type: ${type}` });
  }
});
