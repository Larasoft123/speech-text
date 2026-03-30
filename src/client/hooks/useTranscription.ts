/**
 * Custom hook for client-side Whisper transcription.
 * Runs inference in a Web Worker to keep UI responsive.
 * Automatically detects WebGPU with WASM fallback.
 */

import { useState, useRef, useEffect } from "react";
import { prepareAudioForWhisper } from "@/client/lib/client-audio-utils";
import { useStreaming } from "@/client/hooks/useStreaming";
import { useMicrophoneRecorder } from "@/client/hooks/useMicrophoneRecorder";
import type { TranscriptionResult } from "@/lib/types";
import {
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

// Pending request resolver type
type PendingRequest = {
  resolve: (result: TranscriptionResult) => void;
  reject: (error: Error) => void;
};

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
  // Track per-file loaded/total bytes for weighted aggregate progress
  const fileSizesRef = useRef<Map<string, { loaded: number; total: number }>>(new Map());
  // Per-instance: request counter and pending requests map (no shared module state)
  const requestCounterRef = useRef(0);
  const pendingRequestsRef = useRef(new Map<string, PendingRequest>());

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
          fileSizesRef.current.clear();
          console.log(`[hook] Worker ready`);
          break;
        }

        case "progress": {
          // Track per-file loaded/total bytes for weighted progress
          if (response.file && response.loaded != null && response.total != null) {
            fileSizesRef.current.set(response.file, {
              loaded: response.loaded,
              total: response.total,
            });
          }

          // Calculate aggregate progress from all tracked files
          const sizes = fileSizesRef.current;
          let aggregateProgress = response.progress;
          if (sizes.size > 0) {
            let totalLoaded = 0;
            let totalSize = 0;
            for (const { loaded, total } of sizes.values()) {
              totalLoaded += loaded;
              totalSize += total;
            }
            aggregateProgress = totalSize > 0 ? (totalLoaded / totalSize) * 100 : 0;
          }

          setModelProgress({
            status: response.status,
            file: response.file,
            progress: aggregateProgress,
          });

          if (response.status === "progress" && response.file) {
            const filePercent = response.progress ?? 0;
            setFileProgress((prev) => {
              const existing = prev.find((fp) => fp.file === response.file);
              if (existing) {
                return prev.map((fp) =>
                  fp.file === response.file
                    ? { ...fp, progress: filePercent }
                    : fp,
                );
              }
              return [...prev, { file: response.file!, progress: filePercent }];
            });
          }
          break;
        }

        case "result": {
          const pending = pendingRequestsRef.current.get(response.id);
          if (pending) {
            console.log("result", pending.resolve(response.result));
            pendingRequestsRef.current.delete(response.id);
          }
          break;
        }

        case "error": {
          const pending = pendingRequestsRef.current.get(response.id ?? "");
          if (pending) {
            pending.reject(new Error(response.error));
            pendingRequestsRef.current.delete(response.id ?? "");
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
        // Clean up all pending requests for this instance
        for (const [, pending] of pendingRequestsRef.current) {
          pending.reject(new Error("Component unmounted"));
        }
        pendingRequestsRef.current.clear();
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
      const id = `req-${++requestCounterRef.current}`;

      // Create a promise that resolves when worker responds
      const result = await new Promise<TranscriptionResult>((resolve, reject) => {
        pendingRequestsRef.current.set(id, { resolve, reject });

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



  function stopRecording() {
    if (activeRecorder === "microphone") {
      stopMicrophoneRecording();
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
    stopRecording,
    handleFileChange,
    downloadTranscription,
    initWorker, // NEW: manually initialize worker
  };
}

