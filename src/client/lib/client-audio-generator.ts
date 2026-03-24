/**
 * Audio Generator - Model definitions and contracts for TTS and Music generation.
 * Uses transformers.js pipeline "text-to-speech" and "text-to-audio"
 */

import { LANGUAGES } from "@/lib/types";

export type AudioGeneratorType = "tts" | "music";

export interface Voice {
  id: string;
  label: string;
  /** URL for speaker embeddings (SpeechT5) or voice file name (Supertonic) */
  speakerEmbeddings: string;
  gender?: 'male' | 'female' | 'neutral';
  language?: string;
}

export interface AudioGeneratorModel {
  id: string;
  label: string;
  type: AudioGeneratorType;
  size: string;
  description: string;
  requiresWebGPU?: boolean;
  /** Default speaker embeddings URL (for backward compatibility) */
  speakerEmbeddings?: string;
  /** Available voices for this model */
  voices: readonly Voice[];
  /** Maximum duration in seconds (MusicGen) */
  maxDuration?: number;
  /** Supported languages */
  languages?: readonly (keyof typeof LANGUAGES)[];
  hasStreaming?: boolean;
}

/**
 * TTS Models - Text to Speech
 * Priority: SpeechT5 (most stable) > Supertonic 2 (fastest, multilingual)
 */
export const AVAILABLE_TTS_MODELS: AudioGeneratorModel[] = [
  {
    id: "Xenova/speecht5_tts",
    label: "SpeechT5",
    type: "tts",
    size: "~200MB",
    description: "Mujer - Voz natural, más estable",
    speakerEmbeddings: "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin",
    voices: [
      {
        id: "default",
        label: "Default Female",
        speakerEmbeddings: "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin",
        gender: "female",
      }
    ],
    languages: ["en", "es", "fr", "de", "it"]
  },
  {
    id: "onnx-community/Supertonic-TTS-2-ONNX",
    label: "Supertonic 2",
    type: "tts",
    size: "~66MB",
    description: "Mujer - Ultra rápido (167x), multilingüe",
    requiresWebGPU: true,
    speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/F1.bin",
    voices: [
      { id: "F1", label: "Female 1", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/F1.bin", gender: "female" },
      { id: "F2", label: "Female 2", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/F2.bin", gender: "female" },
      { id: "F3", label: "Female 3", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/F3.bin", gender: "female" },
      { id: "F4", label: "Female 4", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/F4.bin", gender: "female" },
      { id: "F5", label: "Female 5", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/F5.bin", gender: "female" },
      { id: "M1", label: "Male 1", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/M1.bin", gender: "male" },
      { id: "M2", label: "Male 2", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/M2.bin", gender: "male" },
      { id: "M3", label: "Male 3", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/M3.bin", gender: "male" },
      { id: "M4", label: "Male 4", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/M4.bin", gender: "male" },
      { id: "M5", label: "Male 5", speakerEmbeddings: "https://huggingface.co/onnx-community/Supertonic-TTS-2-ONNX/resolve/main/voices/M5.bin", gender: "male" },
    ],
    languages: ["en", "ko", "es", "pt", "fr"],
    hasStreaming: true,
  },
] as const;

/**
 * Music Models - Text to Music/Audio
 * Deferred to Phase 2 (more complex setup)
 */
export const AVAILABLE_MUSIC_MODELS: AudioGeneratorModel[] = [
  {
    id: "Xenova/musicgen-small",
    label: "MusicGen Small",
    type: "music",
    size: "~800MB",
    description: "Meta MusicGen - Generación de música desde texto",
    maxDuration: 30,
    voices: [],
    languages: ["en"]
  }
] as const;


/** Options for audio generation */
export interface AudioGenerationOptions {
  /** Voice identifier (for Supertonic) or speaker embeddings URL */
  voice?: string;
  /** Maximum duration in seconds (for MusicGen) */
  maxDuration?: number;
  /** Language code (if model supports multilingual) */
  language?: string;
}

/** Result from audio generation */
export interface AudioGenerationResult {
  audio: Float32Array;
  samplingRate: number;
  duration?: number;
}
