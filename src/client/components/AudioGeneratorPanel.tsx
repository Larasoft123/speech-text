"use client";

import { useState, useRef, useEffect } from "react";
import {
  useAudioGeneration,
} from "@/client/hooks/useAudioGeneration";
import { AVAILABLE_TTS_MODELS } from "@/client/lib/client-audio-generator";
import { Progress, Button } from "@/shared/components";
import { Checkbox } from "@/shared/components/Checkbox";
import { StreamingAudioPlayer } from "./StreamingAudioPlayer";
import { GeneratedAudioPlayer } from "./GeneratedAudioPlayer";
import { StatusIndicator, type StatusState } from "@/client/components/StatusIndicator";

interface AudioGeneratorPanelProps {
  className?: string;
  onAudioGenerated?: (audioUrl: string, samplingRate: number) => void;
}

export function AudioGeneratorPanel({
  className = "",
  onAudioGenerated,
}: AudioGeneratorPanelProps) {
  const [inputText, setInputText] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const {
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
    generate,
    handleModelChange,
    handleVoiceChange,
    clearAudio,
    downloadAudio,
    stopStreaming,
    pausePlayback,
    resumePlayback,
    seekTo,
    initWorker,
  } = useAudioGeneration();

  const isGenerating = generationState === "generating";
  const isLoading = generationState === "loading";

  const getStatusState = (): StatusState => {
    if (!hasInteracted) return 'idle';
    if (error) return 'error';
    if (isGenerating) return 'processing';
    if (isLoading) return 'loading';
    if (isModelReady) return 'ready';
    return 'idle';
  };

  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Debounce worker initialization by 500ms to prevent simultaneous loading
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      interactionTimeoutRef.current = setTimeout(() => {
        initWorker();
        interactionTimeoutRef.current = null;
      }, 500);
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  const handleGenerate = async () => {
    handleFirstInteraction();
    if (!inputText.trim() || isGenerating || isLoading) return;

    try {
      await generate(inputText);
      if (onAudioGenerated && generatedAudio) {
        onAudioGenerated(generatedAudio.audioUrl, generatedAudio.samplingRate);
      }
    } catch (error) {
      console.error("Transcription error:", error);
    }
  };

  const onModelChange = (modelId: string) => {
    handleModelChange(modelId);
  };

  // Progress display - combine status and progress
  const progressValue = modelProgress?.progress ?? 0;
  const progressStatus = modelProgress?.status ?? "initiate";
  const progressFile = modelProgress?.file ?? "";

  return (
    <div 
      ref={panelRef}
      className={`space-y-6 ${className}`}
      onClick={handleFirstInteraction}
      onFocus={handleFirstInteraction}
      onKeyDown={handleFirstInteraction}
    >
      {/* Column Header with Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">volume_up</span>
          Audio Generation
        </h2>
        <StatusIndicator
          state={getStatusState()}
          model={selectedModel.label}
          device={device || undefined}
          progress={modelProgress?.progress}
        />
      </div>

      {/* Settings Card */}
      <div className="bg-surface-container-low backdrop-blur-sm rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-xl">settings</span>
          <span className="text-sm font-semibold text-on-surface">Generation Settings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Model
            </label>
            <select
              value={selectedModel.id}
              onChange={(e) => onModelChange(e.target.value)}
            disabled={isGenerating}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-sm text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {AVAILABLE_TTS_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.size}) — {m.description}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Voice
            </label>
            {selectedModel.voices.length > 0 ? (
              <select
                value={selectedVoice.id}
                onChange={(e) => handleVoiceChange(e.target.value)}
              disabled={isGenerating}
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-sm text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedModel.voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} {v.gender ? `(${v.gender})` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex-1 bg-surface-container-highest/30 rounded-3xl p-8 backdrop-blur-sm text-on-surface-variant">
                No voices available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generation Card */}
      <div className="bg-surface-container-lowest/40 backdrop-blur-md rounded-[2rem] p-8 space-y-6">
        {/* Status */}
        <div className="flex flex-col items-center gap-4">
          {isGenerating ? (
            <>
              <div className="w-16 h-16 rounded-full border-2 border-secondary/20 border-t-secondary animate-spin" />
              <span className="text-sm text-on-surface-variant">Generating audio...</span>
            </>
          ) : isLoading ? (
            <>
              <div className="w-16 h-16 rounded-full border-2 border-secondary/20 border-t-secondary animate-spin" />
              <span className="text-sm text-on-surface-variant">
                {progressStatus === "initiate"
                  ? "Initializing model..."
                  : progressStatus === "download"
                    ? "Downloading model..."
                    : progressStatus === "progress"
                      ? "Loading model..."
                      : "Loading..."}
              </span>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-outline">
                  record_voice_over
                </span>
              </div>
              <span className="text-sm text-outline">
                {isModelReady ? "Ready to generate" : "Loading model..."}
              </span>
            </>
          )}
        </div>

        {/* Progress Bar - Show during loading or generating */}
        {(isLoading || isGenerating) && modelProgress && (
          <div className="space-y-2">
            <Progress file={progressFile || progressStatus} progress={progressValue} />
            <p className="text-xs text-outline text-center">
              {progressStatus === "initiate"
                ? "Initializing model..."
                : progressStatus === "download"
                  ? "Downloading model files..."
                  : progressStatus === "progress"
                    ? `${progressValue.toFixed(0)}%`
                  : progressStatus === "done"
                    ? "Processing complete!"
                    : progressStatus === "ready"
                      ? "Model ready!"
                      : "Loading..."}
            </p>
          </div>
        )}

        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            Text to Convert
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            disabled={isGenerating}
            rows={4}
            className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <p className="text-[10px] text-outline text-right">
            {inputText.length} characters
          </p>
        </div>

        {/* Streaming Toggle */}
        {selectedModel.hasStreaming && (
          <Checkbox
            label="Enable Real-time Streaming"
            description="Listen token-by-token as the audio is generated. (Beta)"
            checked={isStreamingEnabled}
            onChange={(e) => setIsStreamingEnabled(e.target.checked)}
            disabled={isGenerating || isLoading}
          />
        )}

        {/* Generate Button */}
        <div className="flex flex-col items-center gap-4">
          {isStreaming && streamingProgress && (
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Streaming: {streamingProgress.current}/{streamingProgress.total} chunks</span>
                <span>{streamingProgress.total > 0 ? Math.round((streamingProgress.current / streamingProgress.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-surface-container-lowest rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${streamingProgress.total > 0 ? (streamingProgress.current / streamingProgress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
          
          {isStreaming ? (
            <Button
              onClick={stopStreaming}
              variant="error"
              size="lg"
              fullWidth
              className="max-w-xs"
              icon="stop"
              aria-label="Stop Streaming"
            >
              Stop Streaming
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isGenerating || isLoading}
              variant="secondary"
              size="lg"
              fullWidth
              className="max-w-xs"
              icon="volume_up"
              loading={isGenerating || isLoading}
              aria-label={isGenerating ? "Generating..." : isLoading ? "Loading..." : "Generate Audio"}
            >
              {isGenerating ? "Generating..." : isLoading ? "Loading..." : "Generate Audio"}
            </Button>
          )}

          {isModelReady && (
            <p className="text-[10px] text-outline-variant text-center">
              {device === "webgpu" ? "WebGPU" : "WASM"} • {selectedModel.size} • {selectedModel.label}
            </p>
          )}
          
          {!isModelReady && !isGenerating && (
            <p className="text-[10px] text-outline text-center">
              {device === "webgpu" ? "Using WebGPU" : "Using WASM"} • {selectedModel.size}
            </p>
          )}
        </div>
      </div>

      {/* Playback Section */}
      {isStreamingEnabled ? (
        <StreamingAudioPlayer
          isStreaming={isStreaming}
          streamingProgress={streamingProgress}
          isPlaying={isPlaying}
          currentTime={currentTime}
          totalDuration={totalDuration}
          streamingStartTime={streamingStartTime}
          generatedAudio={generatedAudio}
          stopStreaming={stopStreaming}
          pausePlayback={pausePlayback}
          resumePlayback={resumePlayback}
          downloadAudio={downloadAudio}
          onSeek={seekTo}
        />
      ) : (
        <GeneratedAudioPlayer
          generatedAudio={generatedAudio}
          modelLabel={selectedModel.label}
          downloadAudio={downloadAudio}
          clearAudio={clearAudio}
        />
      )}

      {/* Error */}
      {error && (
        <div className="bg-error/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-error text-xl">error</span>
            <span className="font-semibold text-error">Error</span>
          </div>
          <p className="text-sm text-on-surface-variant">{error}</p>
        </div>
      )}
    </div>
  );
}
