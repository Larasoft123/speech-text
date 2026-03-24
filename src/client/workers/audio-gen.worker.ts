import { pipeline, env, type TextToAudioPipeline } from "@huggingface/transformers";

// Configure environment
env.allowRemoteModels = true;
env.useBrowserCache = true;

// --- Types ---

export interface WorkerRequestInit {
  type: "init";
  modelId: string;
  voice?: string;
}

export interface WorkerRequestGenerate {
  type: "generate";
  id: string;
  text: string;
  voice?: string;
  speakerEmbeddings?: string;
  streaming?: boolean;
}

export interface WorkerRequestDispose {
  type: "dispose";
}

export interface WorkerRequestStopGeneration {
  type: "stop-generation";
}

export type WorkerRequest = WorkerRequestInit | WorkerRequestGenerate | WorkerRequestDispose | WorkerRequestStopGeneration;

export interface WorkerResponseReady {
  type: "ready";
  device: "webgpu" | "wasm";
  modelId: string;
}

export interface WorkerResponseProgress {
  type: "progress";
  status: "initiate" | "download" | "progress" | "done" | "ready";
  progress?: number;
  file?: string;
}

export interface WorkerResponseResult {
  type: "result";
  id: string;
  audio: Float32Array;
  samplingRate: number;
}

export interface WorkerResponseError {
  type: "error";
  id?: string;
  error: string;
}

export interface WorkerResponseAudioChunk {
  type: "audio-chunk";
  id: string;
  chunkIndex: number;
  totalChunks: number;
  audio: Float32Array;
  samplingRate: number;
  isLast: boolean;
}

export type WorkerResponse = WorkerResponseReady | WorkerResponseProgress | WorkerResponseResult | WorkerResponseError | WorkerResponseAudioChunk;

// --- State ---

let tts: any = null;
let currentModelId: string | null = null;
let disposed = false;
let device: "webgpu" | "wasm";
let shouldStopGeneration = false;

// --- Helper Functions ---

function postResponse(response: WorkerResponse): void {
  self.postMessage(response);
}

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

// Supertonic 2 compatible models
const SUPERTRONIC_MODELS = new Set([
  "onnx-community/Supertonic-TTS-2-ONNX",
]);

// --- Text Splitting for Streaming ---

/**
 * Split text into sentences for streaming.
 * Simple implementation that splits on sentence terminators (.!?) and newlines.
 * Handles abbreviations and quotes poorly, but works for basic cases.
 */
function splitTextIntoSentences(text: string): string[] {
  // Split by sentence terminators followed by space or newline, or by newlines
  const rawSentences = text.split(/(?<=[.!?])\s+|\n+/);
  const sentences: string[] = [];
  for (let sentence of rawSentences) {
    sentence = sentence.trim();
    if (sentence.length > 0) {
      sentences.push(sentence);
    }
  }
  // If no sentences found, return the whole text
  if (sentences.length === 0 && text.trim().length > 0) {
    sentences.push(text.trim());
  }
  return sentences;
}



async function initPipeline(modelId: string, voice?: string): Promise<TextToAudioPipeline> {
  if (disposed) {
    throw new Error("Audio generator has been disposed. Reload the page.");
  }

  // Switch model if needed
  if (tts && currentModelId !== modelId) {
    console.log(`[audio-worker] Switching model: ${currentModelId} → ${modelId}`);
    const old = tts;
    await old.dispose();
    tts = null;
    currentModelId = null;
  }

  if (!tts) {
    currentModelId = modelId;
    device = await detectDevice();

    const isSupertonic = SUPERTRONIC_MODELS.has(modelId);

    // SpeechT5 has WebGPU compatibility issues (MatMul kernel errors)
    // Force WASM for SpeechT5, allow WebGPU for Supertonic 2
    if (!isSupertonic && device === "webgpu") {
      console.warn("[audio-worker] SpeechT5: WebGPU has known issues, falling back to WASM.");
      device = "wasm";
    } else if (isSupertonic && device === "wasm") {
      console.warn("[audio-worker] Supertonic works best with WebGPU. Using WASM.");
    }


    const dtype = "fp32";

    console.log(`[audio-worker] Loading model: ${modelId} (device: ${device}, dtype: ${dtype})`);


    tts = await pipeline('text-to-speech', modelId, {
      dtype,
      device,
      progress_callback: (info: {
        status: string;
        file?: string;
        progress?: number;
      }) => {
        postResponse({
          type: "progress",
          status: info.status as "initiate" | "download" | "progress" | "done" | "ready",
          progress: info.progress,
        });
      },
    });

    

  }

  // At this point, tts is guaranteed to be set
  return tts!;
}

// --- Generation ---

async function generateAudioStreaming(
  id: string,
  modelId: string,
  text: string,
  voice?: string,
  speakerEmbeddings?: string
): Promise<void> {
  // Reset stop flag at start of new generation
  shouldStopGeneration = false;
  
  try {
    const synth = await initPipeline(modelId, voice);
    
    // Split text into sentences
    const sentences = splitTextIntoSentences(text);
    console.log(`[audio-worker] Streaming: split text into ${sentences.length} sentences`);
    
    // Build base options (same as non-streaming)
    const isSupertonic = SUPERTRONIC_MODELS.has(modelId);
    const baseOptions: Record<string, unknown> = {};
    
    if (isSupertonic) {
      const speakerEmbed = voice || "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/F1.bin";
      baseOptions.speaker_embeddings = speakerEmbed;
      baseOptions.num_inference_steps = 5;
    } else {
      const speakerEmbed = speakerEmbeddings ||
        "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin";
      baseOptions.speaker_embeddings = speakerEmbed;
    }
    
    // Generate audio for each sentence
    for (let i = 0; i < sentences.length; i++) {
      // Check if generation should stop
      if (shouldStopGeneration) {
        console.log(`[audio-worker] Generation stopped at chunk ${i}`);
        break;
      }
      
      const sentence = sentences[i];
      let inputText = sentence;
      
      // Add language prefix for Supertonic if needed
      if (isSupertonic && !sentence.match(/^<[a-z]{2}>/i)) {
        inputText = `<en>${sentence}</en>`;
      }
      
      console.log(`[audio-worker] Streaming chunk ${i + 1}/${sentences.length}: "${sentence.substring(0, 30)}..."`);
      
      const result = await synth(inputText, baseOptions) as {
        audio: Float32Array;
        sampling_rate: number;
      };
      
      // Check again after generation (in case stop was requested during generation)
      if (shouldStopGeneration) {
        console.log(`[audio-worker] Generation stopped after chunk ${i}`);
        break;
      }
      
      // Add silence between chunks (except after last)
      let audioWithSilence = result.audio;
      if (i < sentences.length - 1) {
        const silenceSamples = Math.floor(0.5 * result.sampling_rate); // 0.5 seconds
        audioWithSilence = new Float32Array(result.audio.length + silenceSamples);
        audioWithSilence.set(result.audio);
        // Rest is already zeros (silence)
      }
      
      // Send chunk to main thread
      postResponse({
        type: "audio-chunk",
        id,
        chunkIndex: i,
        totalChunks: sentences.length,
        audio: audioWithSilence,
        samplingRate: result.sampling_rate,
        isLast: i === sentences.length - 1,
      });
    }
    
    console.log(`[audio-worker] Streaming completed: ${sentences.length} chunks sent`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Streaming generation failed";
    console.error(`[audio-worker] Streaming error: ${message}`);
    postResponse({ type: "error", id, error: message });
  }
}

async function generateAudio(
  id: string,
  modelId: string,
  text: string,
  voice?: string,
  speakerEmbeddings?: string
): Promise<void> {
  try {
    const synth = await initPipeline(modelId, voice);

    console.log(`[audio-worker] Generating audio for: "${text.substring(0, 50)}..."`);

    // Build options based on model type
    const isSupertonic = SUPERTRONIC_MODELS.has(modelId);

    let inputText = text;
    const options: Record<string, unknown> = {};

    if (isSupertonic) {
      // Supertonic 2 requires language prefix in text: <en>, <ko>, <es>, <pt>, <fr>
      // Default to English if not specified
      const speakerEmbed = voice || "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/F1.bin";
      console.log(`[audio-worker] Supertonic using speaker_embeddings: ${speakerEmbed}`);
      options.speaker_embeddings = speakerEmbed;
      // Supertonic 2 supports inference steps for quality
      options.num_inference_steps = 5;

      // Add language prefix for Supertonic 2
      // If text doesn't already have a language tag, add <en>
      if (!text.match(/^<[a-z]{2}>/i)) {
        inputText = `<en>${text}</en>`;
      }
    } else {
      // SpeechT5 uses external speaker embeddings URL from Xenova dataset
      const speakerEmbed = speakerEmbeddings ||
        "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin";
      console.log(`[audio-worker] SpeechT5 using speaker_embeddings: ${speakerEmbed}`);
      options.speaker_embeddings = speakerEmbed;
    }

    // Generate audio
    const result = await synth(inputText, options) as {
      audio: Float32Array;
      sampling_rate: number;
    };

    console.log(`[audio-worker] Generated ${result.audio.length} samples at ${result.sampling_rate}Hz`);

    postResponse({
      type: "result",
      id,
      audio: result.audio,
      samplingRate: result.sampling_rate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Audio generation failed";
    console.error(`[audio-worker] Generation error: ${message}`);
    postResponse({ type: "error", id, error: message });
  }
}

// --- Cleanup ---

async function disposePipeline(): Promise<void> {
  disposed = true;
  if (tts) {
    const p = tts;
    await p.dispose();
    tts = null;
    currentModelId = null;
    console.log("[audio-worker] Pipeline disposed");
  }
}

// --- Message Handler ---

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const { type } = event.data;

  switch (type) {
    case "init": {
      const { modelId, voice } = event.data;
      if (!modelId) {
        postResponse({ type: "error", error: "init requires modelId" });
        return;
      }
      try {
        await initPipeline(modelId, voice);
        // Send ready message with device info
        postResponse({ type: "ready", device, modelId });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to initialize";
        postResponse({ type: "error", error: message });
      }
      break;
    }

    case "generate": {
      const { id, text, voice, speakerEmbeddings, streaming } = event.data;
      if (!id || !text || !currentModelId) {
        postResponse({
          type: "error",
          id,
          error: "generate requires id, text, and initialized model",
        });
        return;
      }
      if (streaming) {
        await generateAudioStreaming(id, currentModelId, text, voice, speakerEmbeddings);
      } else {
        await generateAudio(id, currentModelId, text, voice, speakerEmbeddings);
      }
      break;
    }

    case "dispose": {
      await disposePipeline();
      break;
    }

    case "stop-generation": {
      shouldStopGeneration = true;
      console.log("[audio-worker] Stop generation requested");
      break;
    }

    default:
      postResponse({ type: "error", error: `Unknown message type: ${type}` });
  }
});
