/**
 * Custom hook for client-side Whisper transcription.
 * Runs inference in a Web Worker to keep UI responsive.
 * Automatically detects WebGPU with WASM fallback.
 */

import { useState, useRef, useEffect } from "react";
import { prepareAudioForWhisper } from "@/client/lib/client-audio-utils";
import { useStreaming } from "@/client/hooks/useStreaming";
import { useSystemAudioRecorder } from "@/client/hooks/useSystemAudioRecorder";
import { useMicrophoneRecorder } from "@/client/hooks/useMicrophoneRecorder";
import type { TranscriptionResult } from "@/lib/types";
import {
  AVAILABLE_MODELS,
  type WhisperModel,
  type TimestampGranularity,
} from "@/client/lib/client-transcriber";
import type {
  WorkerRequest,
  WorkerResponse,
} from "@/client/workers/whisper.worker";
import type { FileProgress } from "@/lib/types";
export type { ModelProgress } from "@/lib/types";



export type RecorderState = "idle" | "recording" | "processing";

// Unique ID counter for tracking requests
let requestCounter = 0;

// Pending request resolver
type PendingRequest = {
  resolve: (result: TranscriptionResult) => void;
  reject: (error: Error) => void;
};
const pendingRequests = new Map<string, PendingRequest>();

export function useTranscription(
  model: WhisperModel,
  granularity: TimestampGranularity,
  language: string = "en",
  autoInit: boolean = false, // If false, worker initializes only on first interaction (lazy loading)
) {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [modelProgress, setModelProgress] = useState<{ status: string; file?: string; progress?: number } | null>(null);
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [device, setDevice] = useState<"webgpu" | "wasm" | null>(null);
  const [activeRecorder, setActiveRecorder] = useState<"microphone" | "system" | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Streaming Hook
  const {
    streamingText,
    isStreaming,
    appendChunk,
    startStream,
    stopStream,
    clearStream,
  } = useStreaming();

  
  const {
    startRecording: startSystemRecordingRaw,
    stopRecording: stopSystemRecording,
  } = useSystemAudioRecorder();

  const {
    startRecording: startMicrophoneRecordingRaw,
    stopRecording: stopMicrophoneRecording,
  } = useMicrophoneRecorder();

  // Initialize worker on demand
  const initWorker = () => {
    if (workerRef.current) return;
    
    const worker = new Worker(
      new URL("@/client/workers/whisper.worker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;

      switch (response.type) {
        case "ready": {
          setIsModelReady(true);
          setDevice(response.device);
          setModelProgress(null);
          setFileProgress([]);
          console.log(`[hook] Worker ready`);
          break;
        }

        case "progress": {
          setModelProgress({
            status: response.status,
            file: response.file,
            progress: response.progress,
          });
          if (response.status === "progress" && response.file) {
            setFileProgress((prev) => {
              const existing = prev.find((fp) => fp.file === response.file);
              if (existing) {
                return prev.map((fp) =>
                  fp.file === response.file
                    ? { ...fp, progress: response.progress ?? 0 }
                    : fp,
                );
              }
              return [...prev, { file: response.file!, progress: response.progress ?? 0 }];
            });
          }
          break;
        }

        case "result": {
          const pending = pendingRequests.get(response.id);
          if (pending) {
            console.log("result", pending.resolve(response.result));
            pendingRequests.delete(response.id);
          }
          break;
        }

        case "error": {
          const pending = pendingRequests.get(response.id ?? "");
          if (pending) {
            pending.reject(new Error(response.error));
            pendingRequests.delete(response.id ?? "");
          } else {
            // Non-request error (e.g., init failure)
            setError(response.error);
          }
          break;
        }

        case "stream": {
          appendChunk(response.text);
          console.log("stream", response);
          break;
        }
      }
    };

    worker.onerror = (e) => {
      console.error("[hook] Worker error:", e);
      setError("Worker failed. Please reload the page.");
    };

    workerRef.current = worker;

    // Initialize the pipeline with the current model
    worker.postMessage({ type: "init", modelId: model.id } satisfies WorkerRequest);
  };

  // Initialize worker on mount if autoInit is true
  useEffect(() => {
    if (autoInit) {
      initWorker();
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "dispose" } satisfies WorkerRequest);
        workerRef.current.terminate();
        workerRef.current = null;
        pendingRequests.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoInit]); // Re-run if autoInit changes

  // Re-initialize pipeline when model changes
  useEffect(() => {
    if (workerRef.current) {
      setIsModelReady(false);
      workerRef.current.postMessage({
        type: "init",
        modelId: model.id,
      } satisfies WorkerRequest);
    }
  }, [model.id]);

  /**
   * Transcribe audio using the Web Worker.
   * Audio is transferred (not copied) for zero overhead.
   */
  async function transcribe(file: File): Promise<void> {
    if (!workerRef.current) {
      setError("Worker not initialized. Please wait or reload.");
      return;
    }

    setRecorderState("processing");
    setFileProgress([]);
    setModelProgress(null);
    setSelectedFileName(file.name);
    setError(null);

    try {
      const pcm16k = await prepareAudioForWhisper(file);

      startStream();

      // Generate unique request ID
      const id = `req-${++requestCounter}`;

      // Create a promise that resolves when worker responds
      const result = await new Promise<TranscriptionResult>((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject });

        // Transfer the Float32Array for zero-copy (worker takes ownership)
        workerRef.current!.postMessage(
          {
            type: "transcribe",
            id,
            modelId: model.id,
            granularity,
            audio: pcm16k,
            options: { language },
          } satisfies WorkerRequest,
          [pcm16k.buffer], // Transfer ownership — buffer is transferred, not copied
        );
      });

      setTranscription(result);
      setIsModelReady(true);
      setModelProgress({ status: "ready" });
      setFileProgress([]);
    } catch (err) {
      if (err instanceof Error && err.name === "EncodingError") {
        setError(
          `Unsupported audio format: "${file.name}". Try MP3, WAV, WebM, or OGG.`,
        );
      } else {
        setError(err instanceof Error ? err.message : "Transcription failed");
      }
    } finally {
      stopStream();
      setRecorderState("idle");
      setFileProgress([]);
      setModelProgress(null);
      setSelectedFileName(null);
    }
  }

  

  async function startRecording() {
    setError(null);
    setTranscription(null);
    setActiveRecorder("microphone");
    setRecorderState("recording");

    try {
      const blob = await startMicrophoneRecordingRaw();
      if (blob.type === 'text/plain') {
        const text = await blob.text();
        setTranscription({ text, chunks: [] });
      } else {
        const file = new File([blob], "Recording.webm", { type: blob.type });
        await transcribe(file);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Microphone access denied. Please allow microphone access.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to access microphone");
      }
    } finally {
      setActiveRecorder(null);
      setRecorderState("idle");
    }
  }

  async function startSystemRecording() {
    setError(null);
    setTranscription(null);
    setActiveRecorder("system");
    setRecorderState("recording");

    try {
      const blob = await startSystemRecordingRaw();
      const file = new File([blob], "SystemAudio.webm", { type: "audio/webm" });
      await transcribe(file);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to capture system audio",
      );
    } finally {
      setActiveRecorder(null);
      setRecorderState("idle");
    }
  }

  function stopRecording() {
    if (activeRecorder === "microphone") {
      stopMicrophoneRecording();
    } else if (activeRecorder === "system") {
      stopSystemRecording();
    }
  }

  // --- File upload handler ---

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setTranscription(null);
    setSelectedFileName(file.name);

    try {
      await transcribe(file);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to read file",
      );
      setSelectedFileName(null);
    }

    // Reset input so the same file can be selected again
    e.target.value = "";
  }

  // --- Download handler ---

  function downloadTranscription() {
    if (!transcription) return;

    const blob = new Blob([transcription.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    // State
    recorderState,
    modelProgress,
    fileProgress,
    transcription,
    error,
    isModelReady,
    selectedFileName,
    device,

    // Streaming
    streamingText,
    isStreaming,
    clearStream,

    // File input ref (for the component to attach)
    fileInputRef,

    // Actions
    startRecording,
    startSystemRecording,
    stopRecording,
    handleFileChange,
    downloadTranscription,
    initWorker, // NEW: manually initialize worker
  };
}

