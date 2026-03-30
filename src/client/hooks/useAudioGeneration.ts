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
  // Per-instance: request counter and pending requests map (no shared module state)
  const requestCounterRef = useRef(0);
  const pendingRequestsRef = useRef(new Map<string, PendingRequest>());
  
  // Audio streaming state
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const animationFrameRef = useRef<number>(0);
  const playbackStartTimeRef = useRef<number>(0);
  const accumulatedDurationRef = useRef<number>(0);
  const isPlaybackInterruptedRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const previousStreamingEnabledRef = useRef(isStreamingEnabled);
  const audioChunksRef = useRef<Float32Array[]>([]); // Accumulate chunks for seek


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
   * Reset all audio-related state to idle, cleaning up resources.
   */
  const resetAudioState = () => {
    // Stop all active source nodes
    activeSourceNodesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    activeSourceNodesRef.current = [];

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Cancel animation frame
    cancelAnimationFrame(animationFrameRef.current);

    // Reset refs
    nextPlayTimeRef.current = 0;
    accumulatedDurationRef.current = 0;
    playbackStartTimeRef.current = 0;
    isPlaybackInterruptedRef.current = true;
    isPausedRef.current = false;

    // Reset state
    setCurrentTime(0);
    setTotalDuration(0);
    setIsPlaying(false);
    setIsStreaming(false);
    setStreamingProgress(null);
    setStreamingStartTime(null);
    setGenerationState("idle");
    setError(null);
    // Clear generated audio (revoke URL and clear state)
    if (currentAudioUrlRef.current) {
      revokeAudioUrl(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    currentAudioDataRef.current = null;
    setGeneratedAudio(null);
  };

  /**
   * Stop streaming playback completely
   */
  const stopStreamingPlayback = () => {
    // Send stop message to worker to cancel generation
    if (workerRef.current) {
      workerRef.current.postMessage({ type: "stop-generation" });
    }
    resetAudioState();
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
          const pending = pendingRequestsRef.current.get(response.id);
          if (pending) {
            pending.resolve({
              audio: response.audio,
              samplingRate: response.samplingRate,
            });
            pendingRequestsRef.current.delete(response.id);
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
            // Clear previous chunks
            audioChunksRef.current = [];
          }
          
          const ctx = audioContextRef.current;
          if (ctx.state === "suspended" && !isPausedRef.current) {
            ctx.resume();
          }
          
          // Accumulate chunk for seek functionality
          audioChunksRef.current.push(new Float32Array(audio));
          
          // Create AudioBuffer for playback
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
          
          // If last chunk, create complete audio buffer for seek
          if (isLast) {
            // Concatenate all chunks into a single buffer
            const totalLength = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
            const completeAudio = new Float32Array(totalLength);
            let offset = 0;
            for (const chunk of audioChunksRef.current) {
              completeAudio.set(chunk, offset);
              offset += chunk.length;
            }
            
            // Store complete audio for download and seek
            currentAudioDataRef.current = completeAudio;
            
            // Create complete AudioBuffer for seek functionality
            if (audioContextRef.current) {
              const completeBuffer = audioContextRef.current.createBuffer(1, completeAudio.length, samplingRate);
              completeBuffer.getChannelData(0).set(completeAudio);
              // Store reference for seek (we'll use this in seekTo)
              (audioContextRef.current as any).__completeBuffer = completeBuffer;
            }
            
            // Resolve pending request if any
            const pending = pendingRequestsRef.current.get(id);
            if (pending) {
              pending.resolve({
                audio: completeAudio,
                samplingRate: samplingRate,
              });
              pendingRequestsRef.current.delete(id);
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
          const pending = pendingRequestsRef.current.get(response.id ?? "");
          if (pending) {
            pending.reject(new Error(response.error));
            pendingRequestsRef.current.delete(response.id ?? "");
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
        // Clean up all pending requests for this instance
        for (const [, pending] of pendingRequestsRef.current) {
          pending.reject(new Error("Component unmounted"));
        }
        pendingRequestsRef.current.clear();
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

    // Clean up previous audio resources to prevent concatenation
    resetAudioState();

    setGenerationState("generating");
    setModelProgress(null);
    setError(null);
    setGeneratedAudio(null);
    if (isStreamingEnabled) {
      setIsStreaming(true);
      setStreamingProgress({ current: 0, total: 0 });
    } else {
      setIsStreaming(false);
      setStreamingProgress(null);
    }
    setStreamingStartTime(Date.now());
    isPlaybackInterruptedRef.current = false;

    try {
      // Generate unique request ID
      const id = `gen-${++requestCounterRef.current}`;

      // Create a promise that resolves when worker responds
      const result = await new Promise<AudioGenerationResult>((resolve, reject) => {
        pendingRequestsRef.current.set(id, { resolve, reject });

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

  // Clear generated audio when streaming is disabled
  useEffect(() => {
    if (previousStreamingEnabledRef.current && !isStreamingEnabled) {
      // Streaming changed from true to false
      clearAudio();
    }
    previousStreamingEnabledRef.current = isStreamingEnabled;
  }, [isStreamingEnabled, clearAudio]);

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

  /**
   * Seek to a specific time in the audio playback.
   * Works after streaming generation is complete.
   */
  const seekTo = async (time: number) => {
    if (!audioContextRef.current || !currentAudioDataRef.current || isStreaming) {
      console.log("[audio-hook] Seek not available: audioContext or audio data missing, or still streaming");
      return;
    }

    // Validate time bounds
    const clampedTime = Math.max(0, Math.min(time, totalDuration));
    
    // Cancel any existing animation frame
    cancelAnimationFrame(animationFrameRef.current);
    
    // Stop current playback
    activeSourceNodesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    activeSourceNodesRef.current = [];

    // Use complete buffer if available, otherwise create from data
    const ctx = audioContextRef.current;
    let buffer: AudioBuffer;
    const completeBuffer = (ctx as any).__completeBuffer as AudioBuffer | undefined;
    const samplingRate = generatedAudio?.samplingRate || 44100;
    
    if (completeBuffer) {
      buffer = completeBuffer;
    } else {
      buffer = ctx.createBuffer(1, currentAudioDataRef.current.length, samplingRate);
      buffer.getChannelData(0).set(currentAudioDataRef.current);
    }

    // Resume context if suspended (was paused)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // Reset playback interrupted flag so animation frame works
    isPlaybackInterruptedRef.current = false;
    isPausedRef.current = false;

    // Create new source node
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Calculate start position in seconds for the source.start offset parameter
    const offsetSeconds = clampedTime;

    // Schedule playback from seek position
    source.start(0, offsetSeconds);
    activeSourceNodesRef.current.push(source);

    // Update current time and playback start reference
    playbackStartTimeRef.current = ctx.currentTime - clampedTime;
    setCurrentTime(clampedTime);
    setIsPlaying(true);
    
    // Start animation loop for time updates
    startUpdateTimeAnimation(ctx);

    // Clean up source when it ends
    source.onended = () => {
      const index = activeSourceNodesRef.current.indexOf(source);
      if (index > -1) {
        activeSourceNodesRef.current.splice(index, 1);
      }
      // If no more sources playing, set isPlaying to false
      if (activeSourceNodesRef.current.length === 0) {
        setIsPlaying(false);
      }
    };

    console.log(`[audio-hook] Seeked to ${clampedTime.toFixed(2)} seconds`);
  };

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
    seekTo,
    initWorker, // NEW: manually initialize worker
  };
}

