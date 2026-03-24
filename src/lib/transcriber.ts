import { pipeline, type AutomaticSpeechRecognitionPipeline } from "@huggingface/transformers";
import type { TranscriptionResult, TranscriptionOptions } from "./types";
import {
  estimateAudioDuration,
  buildPipelineOptions,
} from "./transcription-utils";

export type { TranscriptionResult, TranscriptionOptions } from "./types";

const MODEL_ID = "onnx-community/whisper-base_timestamped";

/**
 * Singleton manager for the Whisper ASR pipeline.
 * Uses `globalThis` to survive Next.js dev hot-reloads
 * (same pattern as Prisma, DB clients, etc.).
 */
function getTranscriber(): Promise<AutomaticSpeechRecognitionPipeline> {
  const globalKey = "__whisper_transcriber__" as const;
  const g = globalThis as typeof globalThis & {
    [globalKey]?: Promise<AutomaticSpeechRecognitionPipeline>;
  };

  if (!g[globalKey]) {
    console.log(`[transcriber] Loading model: ${MODEL_ID}`);

    g[globalKey] = pipeline("automatic-speech-recognition", MODEL_ID, {
      dtype: "q8",
    });

    g[globalKey].then(() => {
      console.log("[transcriber] Model loaded and ready");
    });
  }

  return g[globalKey];
}

/**
 * Transcribe a pre-processed audio buffer (Float32Array, 16kHz mono).
 *
 * Supports both short (<30s) and long (>30s) audio through chunked
 * transcription with sliding window.
 *
 * @param audioData - Raw audio as Float32Array at 16kHz mono
 * @param options - Transcription options
 */
export async function transcribeAudio(
  audioData: Float32Array,
  options: TranscriptionOptions = {},
): Promise<TranscriptionResult> {
  const transcriber = await getTranscriber();

  const duration = estimateAudioDuration(audioData);

  console.log(
    `[transcriber] Processing ${duration.toFixed(1)}s audio`,
  );

  const pipelineOptions = buildPipelineOptions(options, duration);

  const result = await transcriber(
    audioData,
    pipelineOptions as Parameters<typeof transcriber>[1],
  );

  const output = Array.isArray(result) ? result[0] : result;

  return {
    text: output.text.trim(),
    chunks: (output.chunks ?? []).map((chunk) => ({
      text: chunk.text,
      timestamp: chunk.timestamp as [number, number],
    })),
  };
}
