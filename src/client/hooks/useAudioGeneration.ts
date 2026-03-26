/**
 * Custom hook for client-side TTS audio generation.
 * Runs inference in a Web Worker to keep UI responsive.
 * Automatically detects WebGPU with WASM fallback.
 */

import { useState, useRef, useEffect } from "react";
import { audioToBlobUrl, revokeAudioUrl, downloadAudio as downloadAudioUtil } from "@/client/lib/client-audio-utils";
import {
  AVAILABLE_TTS_MODELS,
  type AudioGeneratorModel,
  type AudioGenerationResult,
  type Voice,
} from "@/client/lib/client-audio-generator";
import type {
  WorkerRequest,
  WorkerResponse,
} from "@/client/workers/audio-gen.worker";

// ============================================================================
// Types
// ============================================================================

export type GenerationState = "idle" | "loading" | "generating";

// Pending request resolver
type PendingRequest = {
  resolve: (result: AudioGenerationResult) => void;
  reject: (error: Error) => void;
};

// ============================================================================
// State
// ============================================================================

let requestCounter = 0;
const pendingRequests = new Map<string, PendingRequest>();

// ============================================================================
// Hook
// ============================================================================

export function useAudioGeneration(initialModel?: AudioGeneratorModel, autoInit: boolean = false) { // autoInit: false = lazy loading on first interaction
  const defaultModel = initialModel ?? AVAILABLE_TTS_MODELS[0];
  
  const [selectedModel, setSelectedModel] = useState<AudioGeneratorModel>(defaultModel);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(defaultModel.voices[0]);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [modelProgress, setModelProgress] = useState<{ status: string; progress?: number; file?: string } | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<{ audioUrl: string; samplingRate: number; audioData: Float32Array } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [device, setDevice] = useState<"webgpu" | "wasm" | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState<{ current: number; total: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [streamingStartTime, setStreamingStartTime] = useState<number | null>(null);
  
  // Streaming configuration toggle
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const currentAudioDataRef = useRef<Float32Array | null>(null);
  const lastInitializedModelIdRef = useRef<string | null>(null);
  
  // Audio streaming state
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const animationFrameRef = useRef<number>(0);
  const playbackStartTimeRef = useRef<number>(0);
  const accumulatedDurationRef = useRef<number>(0);
  const isPlaybackInterruptedRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);

  const startUpdateTimeAnimation = (ctx: AudioContext) => {
    const updateTime = () => {
      if (!isPlaybackInterruptedRef.current && ctx.state === "running") {
        const elapsed = ctx.currentTime - playbackStartTimeRef.current;
        setCurrentTime(Math.min(elapsed, accumulatedDurationRef.current));
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };
    animationFrameRef.current = requestAnimationFrame(updateTime);
  };
  
  /**
   * Pause playback - just suspend context
   */
  const pausePlayback = async () => {
    console.log("[audio-hook] Pause requested");
    if (audioContextRef.current && audioContextRef.current.state === "running") {
      try {
        await audioContextRef.current.suspend();
        isPausedRef.current = true;
        setIsPlaying(false);
        cancelAnimationFrame(animationFrameRef.current);
        console.log("[audio-hook] Paused successfully. Context state:", audioContextRef.current.state);
      } catch (e) {
        console.error("Failed to suspend audio context:", e);
      }
    } else {
      console.log("[audio-hook] Cannot pause: context not running or null. State:", audioContextRef.current?.state);
    }
  };
  
  /**
   * Resume playback - just resume context
   */
  const resumePlayback = async () => {
    console.log("[audio-hook] Resume requested. Context state:", audioContextRef.current?.state);
    if (audioContextRef.current) {
      try {
        await audioContextRef.current.resume();
        isPausedRef.current = false;
        setIsPlaying(true);
        startUpdateTimeAnimation(audioContextRef.current);
        console.log("[audio-hook] Resumed successfully. Context state:", audioContextRef.current.state);
      } catch (e) {
        console.error("Failed to resume audio context:", e);
      }
    } else {
      console.log("[audio-hook] Cannot resume: no audio context");
    }
  };
  
  /**
   * Stop streaming playback completely
   */
  const stopStreamingPlayback = () => {
    // Send stop message to worker to cancel generation
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "stop-generation" });
    }
    
    isPlaybackInterruptedRef.current = true;
    isPausedRef.current = false;
    
    // Stop all active sources
    activeSourceNodesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    activeSourceNodesRef.current = [];
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    cancelAnimationFrame(animationFrameRef.current);
    nextPlayTimeRef.current = 0;
    accumulatedDurationRef.current = 0;
    setCurrentTime(0);
    setTotalDuration(0);
    setIsPlaying(false);
    setIsStreaming(false);
    setStreamingProgress(null);
    setStreamingStartTime(null);
  };
  
  // Initialize worker on demand
  const initWorker = () => {
    if (workerRef.current) return;
    
    const worker = new Worker(
      new URL("@/client/workers/audio-gen.worker.ts", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data;

      switch (response.type) {
        case "ready": {
          setIsModelReady(true);
          setDevice(response.device);
          setGenerationState("idle");
          setModelProgress(null);
          console.log(`[audio-hook] Worker ready with ${response.device}`);
          break;
        }

        case "progress": {
          setModelProgress({
            status: response.status,
            progress: response.progress,
            file: response.file,
          });
          break;
        }

        case "result": {
          const pending = pendingRequests.get(response.id);
          if (pending) {
            pending.resolve({
              audio: response.audio,
              samplingRate: response.samplingRate,
            });
            pendingRequests.delete(response.id);
          }
          break;
        }

        case "audio-chunk": {
          const { chunkIndex, totalChunks, audio, samplingRate, isLast, id } = response;
          
          // Initialize audio context if needed
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            playbackStartTimeRef.current = audioContextRef.current.currentTime + 0.1;
            nextPlayTimeRef.current = playbackStartTimeRef.current;
          }
          
          const ctx = audioContextRef.current;
          if (ctx.state === "suspended" && !isPausedRef.current) {
            ctx.resume();
          }
          
          // Create AudioBuffer
          const buffer = ctx.createBuffer(1, audio.length, samplingRate);
          buffer.getChannelData(0).set(audio);
          
          // Create source and schedule playback
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          
          // Schedule to start at nextPlayTime
          source.start(nextPlayTimeRef.current);
          activeSourceNodesRef.current.push(source);
          
          // Update next play time for next chunk
          nextPlayTimeRef.current += buffer.duration;
          
          // Update total duration
          accumulatedDurationRef.current += buffer.duration;
          setTotalDuration(accumulatedDurationRef.current);
          
          // Update progress
          setStreamingProgress({ current: chunkIndex + 1, total: totalChunks });
          
          // Set playing state
          setIsPlaying(true);
          
          // Start animation loop for time updates
          startUpdateTimeAnimation(ctx);
          
          // Remove source from array when it ends
          source.onended = () => {
            const index = activeSourceNodesRef.current.indexOf(source);
            if (index > -1) {
              activeSourceNodesRef.current.splice(index, 1);
            }
          };
          
          // If last chunk, store audio data for download and resolve pending
          if (isLast) {
            // Store for later download
            currentAudioDataRef.current = audio; // Store last chunk, full audio will be concatenated at end
            
            // Resolve pending request if any
            const pending = pendingRequests.get(id);
            if (pending) {
              pending.resolve({
                audio: audio,
                samplingRate: samplingRate,
              });
              pendingRequests.delete(id);
            }
            
            // Reset streaming state
            setIsStreaming(false);
            setStreamingProgress(null);
          }
          break;
        }

        case "error": {
          console.error("[audio-hook] Error:", response.error);
          setGenerationState("idle");
          setError(response.error);
          const pending = pendingRequests.get(response.id ?? "");
          if (pending) {
            pending.reject(new Error(response.error));
            pendingRequests.delete(response.id ?? "");
          }
          break;
        }
      }
    };

    worker.onerror = (e) => {
      console.error("[audio-hook] Worker error:", e);
      setError("Worker failed. Please reload the page.");
      setGenerationState("idle");
    };

    workerRef.current = worker;

    // Initialize the pipeline with the current model and default voice
    setIsModelReady(false);
    setGenerationState("loading");
    setError(null);
    const voiceOrEmbeddings = selectedVoice.speakerEmbeddings;
    lastInitializedModelIdRef.current = selectedModel.id;
    worker.postMessage({ 
      type: "init", 
      modelId: selectedModel.id,
      voice: voiceOrEmbeddings,
      speakerEmbeddings: voiceOrEmbeddings
    } as WorkerRequest);
  };

  // Initialize worker on mount if autoInit is true
  useEffect(() => {
    if (autoInit) {
      initWorker();
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "dispose" } as WorkerRequest);
        workerRef.current.terminate();
        workerRef.current = null;
        pendingRequests.clear();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoInit]); // Re-run if autoInit changes


  useEffect(() => {
    // Only re-initialize if the model has actually changed
    if (workerRef.current && selectedModel.id !== lastInitializedModelIdRef.current) {
      setIsModelReady(false);
      setGeneratedAudio(null);
      setError(null);
      setGenerationState("loading");
      
      const voiceOrEmbeddings = selectedVoice.speakerEmbeddings;
      lastInitializedModelIdRef.current = selectedModel.id;
      workerRef.current.postMessage({
        type: "init",
        modelId: selectedModel.id,
        voice: voiceOrEmbeddings,
        speakerEmbeddings: voiceOrEmbeddings,
      } as WorkerRequest);
    }
  }, [selectedModel.id]);


  const generate = async (text: string): Promise<string> => {
    if (!workerRef.current) {
      throw new Error("Worker not initialized. Please wait or reload.");
    }

    if (!text.trim()) {
      throw new Error("Please enter text to convert to speech.");
    }

    // Clean up previous audio URL
    if (currentAudioUrlRef.current) {
      revokeAudioUrl(currentAudioUrlRef.current);
    }

    setGenerationState("generating");
    setModelProgress(null);
    setError(null);
    setGeneratedAudio(null);
    setIsStreaming(true);
    setStreamingProgress({ current: 0, total: 0 });
    setStreamingStartTime(Date.now());
    isPlaybackInterruptedRef.current = false;

    try {
      // Generate unique request ID
      const id = `gen-${++requestCounter}`;

      // Create a promise that resolves when worker responds
      const result = await new Promise<AudioGenerationResult>((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject });

        const voiceOrEmbeddings = selectedVoice.speakerEmbeddings;
        console.log(`[audio-hook] Generating with voice: ${voiceOrEmbeddings}`);
        workerRef.current!.postMessage(
          {
            type: "generate",
            id,
            text: text.trim(),
            voice: voiceOrEmbeddings,
            speakerEmbeddings: voiceOrEmbeddings,
            streaming: isStreamingEnabled,
          } as WorkerRequest,
        );
      });

      // Convert audio to blob URL for playback
      const audioUrl = audioToBlobUrl(result.audio, result.samplingRate);
      currentAudioUrlRef.current = audioUrl;
      currentAudioDataRef.current = result.audio;

      setGeneratedAudio({
        audioUrl,
        samplingRate: result.samplingRate,
        audioData: result.audio,
      });

      setIsModelReady(true);
      setGenerationState("idle");

      return audioUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Audio generation failed";
      setError(errorMessage);
      setGenerationState("idle");
      throw err;
    }
  };

  /**
   * Handle model change from UI
   */
  const handleModelChange = (modelId: string) => {
    const model = AVAILABLE_TTS_MODELS.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      setSelectedVoice(model.voices[0]); // Reset to first voice of new model
    }
  };

  /**
   * Handle voice change from UI
   */
  const handleVoiceChange = (voiceId: string) => {
    const voice = selectedModel.voices.find((v) => v.id === voiceId);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  /**
   * Clean up generated audio URL
   */
  const clearAudio = () => {
    if (currentAudioUrlRef.current) {
      revokeAudioUrl(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    currentAudioDataRef.current = null;
    setGeneratedAudio(null);
  }

  /**
   * Stop streaming playback and reset state
   */
  const stopStreaming = () => {
    stopStreamingPlayback();
  };

  /**
   * Download generated audio as WAV file
   */
  const downloadAudio = () => {
    if (!generatedAudio || !currentAudioDataRef.current) return;
    
    downloadAudioUtil(
      currentAudioDataRef.current, 
      generatedAudio.samplingRate, 
      `tts-audio-${Date.now()}.wav`
    );
  }

  return {
    // State
    selectedModel,
    selectedVoice,
    generationState,
    modelProgress,
    generatedAudio,
    error,
    isModelReady,
    device,
    isStreaming,
    streamingProgress,
    isPlaying,
    currentTime,
    totalDuration,
    streamingStartTime,
    isStreamingEnabled,
    setIsStreamingEnabled,

    // Actions
    generate,
    handleModelChange,
    handleVoiceChange,
    clearAudio,
    downloadAudio,
    stopStreaming,
    pausePlayback,
    resumePlayback,
    initWorker, // NEW: manually initialize worker
  };
}

// ============================================================================
// Helpers
// ============================================================================

// Re-export available models for convenience
export { AVAILABLE_TTS_MODELS };
export type { AudioGeneratorModel, AudioGenerationResult };
