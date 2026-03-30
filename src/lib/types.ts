/**
 * Shared types for Whisper transcription across client and server.
 * These interfaces are platform-agnostic.
 */

export interface TranscriptionChunk {
  text: string;
  timestamp: [number, number];
}

export interface TranscriptionResult {
  text: string;
  chunks: TranscriptionChunk[];
}

export interface ModelProgress {
  status: "initiate" | "download" | "progress" | "done" | "ready" | "error";
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

/**
 * Options for Whisper transcription.
 * @see https://huggingface.co/docs/transformers.js/api/pipelines#AutomaticSpeechRecognitionPipeline
 */
export interface TranscriptionOptions {
  /**
   * Language code (e.g., "en", "es", "fr").
   * Defaults to "en" if not specified.
   */
  language?: string;

  /**
   * Granularity of timestamps.
   * - "word": Word-level timestamps (more detailed, slower)
   * - "phrase": Segment-level timestamps (default for >30s audio)
   */
  timestampGranularity?: "word" | "phrase";

  /**
   * Maximum number of tokens to generate.
   * - Short audio (<30s): ~128 tokens is sufficient
   * - Long audio (>30s): Use 1024+ for comprehensive transcripts
   * @default 128
   */
  maxNewTokens?: number;

  /**
   * Whether to use condition on previous tokens for sequential generation.
   * When enabled, the decoder maintains context between audio chunks,
   * resulting in better accuracy for long-form transcription.
   * @default true
   */
  conditionOnPrevTokens?: boolean;
}


export interface FileProgress {
  file: string;
  progress: number;
}


export const LANGUAGES = {
  "en": "English",
  "es": "Spanish",
  "fr": "French",
  "de": "German",
  "it": "Italian",
  "ko": "Korean",
  "pt": "Portuguese",
} as const;





