/**
 * Shared utilities for Whisper transcription.
 * Platform-agnostic: works in both Node.js (server) and browser (client).
 */

import type { TranscriptionOptions } from "./types";

/**
 * English-only models (with .en suffix) do NOT accept `language` or `task` parameters.
 * They are pre-configured to only transcribe English.
 * Only multilingual models (like onnx-community/whisper-base_timestamped) accept these.
 *
 * @param modelId - The HuggingFace model ID
 * @returns true if the model is English-only
 */
export function isEnglishOnlyModel(modelId: string): boolean {
  return modelId.endsWith(".en");
}

/**
 * Estimate audio duration from Float32Array samples.
 * Whisper's encoder has a 30-second context window.
 *
 * @param audioData - Raw audio as Float32Array at 16kHz mono
 * @param sampleRate - Sample rate (default 16kHz for Whisper)
 */
export function estimateAudioDuration(
  audioData: Float32Array,
  sampleRate = 16000,
): number {
  return audioData.length / sampleRate;
}

/**
 * Determine appropriate max_new_tokens based on audio duration.
 * Rule of thumb: ~2 tokens per second of English speech.
 *
 * @param durationSeconds - Audio duration in seconds
 */
export function getDefaultMaxNewTokens(durationSeconds: number): number {
  if (durationSeconds <= 30) return 128;
  if (durationSeconds <= 60) return 256;
  if (durationSeconds <= 120) return 512;
  if (durationSeconds <= 300) return 1024;
  return 2048;
}

/**
 * Build pipeline options for Whisper transcription.
 * Handles both short (<30s) and long (>30s) audio.
 *
 * For audio > 30s, Whisper REQUIRES chunk_length_s to avoid truncation.
 * The model encoder has a 30s context window, so long audio must be chunked.
 *
 * IMPORTANT: English-only models (ending in .en) do NOT accept `language` or `task`
 * parameters. These are pre-configured for English transcription only.
 * Passing these parameters to English-only models causes:
 * "Cannot specify `task` or `language` for an English-only model"
 *
 * @param options - Transcription options from caller
 * @param duration - Audio duration in seconds
 * @param modelId - The model ID (to determine if language/task params are valid)
 * @returns Pipeline options object
 */
export function buildPipelineOptions(
  options: TranscriptionOptions,
  duration: number,
  modelId?: string,
): Record<string, unknown> {
  const {
    language = "en",
    timestampGranularity = "phrase",
    maxNewTokens,
    conditionOnPrevTokens = true,
  } = options;

  const isLongAudio = duration > 30;
  const englishOnly = modelId ? isEnglishOnlyModel(modelId) : false;

  // Only include language and task for multilingual models.
  // English-only models (.en suffix) are pre-configured for English.
  const pipelineOptions: Record<string, unknown> = {
    return_timestamps: timestampGranularity === "word" ? "word" : true,
    ...(englishOnly
      ? {}
      : {
          language,
          task: "transcribe",
        }),
    max_new_tokens: maxNewTokens ?? getDefaultMaxNewTokens(duration),
  };

  // For audio > 30s, Whisper needs chunking to process the full audio
  if (isLongAudio) {
    // chunk_length_s: Size of audio chunks in seconds.
    // Using 29 instead of 30 to avoid known timestamp bugs at exact boundaries.
    // See: https://github.com/huggingface/transformers.js/issues/1358
    pipelineOptions.chunk_length_s = 29;
    // stride_length_s: Overlap between chunks (5s = chunk_length / 6).
    // Helps capture words that span chunk boundaries.
    pipelineOptions.stride_length_s = 5;
    // Sequential generation: decoder sees previous tokens for better continuity.
    if (conditionOnPrevTokens) {
      pipelineOptions.condition_on_prev_tokens = true;
    }
  }

  return pipelineOptions;
}
