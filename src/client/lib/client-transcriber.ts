export type { TranscriptionResult, TranscriptionOptions } from "@/lib/types";
import { LANGUAGES } from "@/lib/types";



export type TimestampGranularity = "word" | "phrase";

export interface WhisperModel {
  id: string;
  label: string;
  size: string;
  description: string;
  requiresWebGPU?: boolean;
  languages: (keyof typeof LANGUAGES)[]
  timestampGranularity: TimestampGranularity[];

}

export const AVAILABLE_MODELS: WhisperModel[] = [
  {
    id: "Xenova/whisper-tiny.en",
    label: "Tiny",
    size: "~39MB",
    description: "Fastest, lower accuracy",
    languages: ["en"],
    timestampGranularity: ["word"]

  },
  {
    id: "Xenova/whisper-base.en",
    label: "Base",
    size: "~74MB",
    description: "Balanced speed & accuracy",
    languages: ["en"],
    timestampGranularity: ["word", "phrase"]

  },
  {
    id: "onnx-community/whisper-base_timestamped",
    label: "Base (Timestamped)",
    size: "~150MB",
    description: "Optimized for timestamps",
    languages: ["en", "es", "fr", "it"],
    timestampGranularity: ["word", "phrase"]
  },
  {
    id: "Xenova/whisper-small.en",
    label: "Small",
    size: "~243MB",
    description: "Better accuracy, slower",
    languages: ["en"],
    timestampGranularity: ["word"]

  },
];
