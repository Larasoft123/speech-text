"use client";

import  { useRef, useCallback, useState, useEffect } from 'react';
import { useTranscription } from '@/client/hooks/useTranscription';
import { StatusIndicator, type StatusState } from '@/client/components/StatusIndicator';
import { ErrorBoundary } from '@/client/components/ErrorBoundary';
import { TranscriptionDisplay } from '@/client/components/TranscriptionDisplay';
import { Progress } from '@/shared/components';
import { IconSelect } from '@/shared/components/IconSelect';

import type { WhisperModel, TimestampGranularity } from '@/client/lib/client-transcriber';
import { AVAILABLE_MODELS } from '@/client/lib/client-transcriber';
import type { LanguageCode } from '@/shared/components/LanguageSelect';

interface TranscriptionColumnProps {
  className?: string;
}

export function TranscriptionColumn({
  className = '',
}: TranscriptionColumnProps) {
  const [selectedModel, setSelectedModel] = useState<WhisperModel>(AVAILABLE_MODELS[2]);
  const [timestampGranularity, setTimestampGranularity] = useState<TimestampGranularity>("word");
  const [language, setLanguage] = useState<LanguageCode>(selectedModel.languages[0]);

  const handleModelChange = (modelId: string) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (!model) return;
    setSelectedModel(model);
    // Reset language if current one isn't supported by new model
    if (!model.languages.includes(language)) {
      setLanguage(model.languages[0]);
    }
  };

  const columnRef = useRef<HTMLDivElement>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const {
    recorderState,
    modelProgress,
    fileProgress,
    transcription,
    error,
    isModelReady,
    selectedFileName,
    device,
    streamingText,
    isStreaming,
    fileInputRef,
    startRecording,
    stopRecording,
    handleFileChange,
    downloadTranscription,
    initWorker,
  } = useTranscription(selectedModel, timestampGranularity, language, false); // autoInit = false

  // Determine status state for indicator
  const getStatusState = (): StatusState => {
    if (!hasInteracted) return 'idle';
    if (error) return 'error';
    if (recorderState === 'processing') return 'processing';
    if (recorderState === 'recording') return 'processing';
    if (modelProgress) return 'loading';
    if (isModelReady) return 'ready';
    return 'idle';
  };

  // const isModelLoading = hasInteracted && !isModelReady && !modelProgress; // Unused after skeleton removal

  const handleFirstInteraction = useCallback(() => {
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
  }, [hasInteracted, initWorker]);

  // Attach interaction listeners to column
  const handleColumnClick = useCallback(() => {
    handleFirstInteraction();
  }, [handleFirstInteraction]);

  const handleColumnFocus = useCallback(() => {
    handleFirstInteraction();
  }, [handleFirstInteraction]);

  const handleColumnKeyDown = useCallback(() => {
    handleFirstInteraction();
  }, [handleFirstInteraction]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={columnRef}
      className={`space-y-6 ${className}`}
      onClick={handleColumnClick}
      onFocus={handleColumnFocus}
      onKeyDown={handleColumnKeyDown}
      tabIndex={0} // Make div focusable
    >
      <ErrorBoundary>
        {/* Column Header with Status */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">mic</span>
            Transcription
          </h2>
          <StatusIndicator
            state={getStatusState()}
            model={selectedModel.label}
            device={device || undefined}
            progress={modelProgress?.progress}
          />
        </div>

        {/* Compact Info Card */}
        <div className="bg-surface-container-low backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
              Runs Whisper in your browser. Model cached after first load.
            </p>
            <button className="text-secondary text-xs">Details</button>
          </div>
        </div>

        {/* Compact Settings Card */}
        <div className="bg-surface-container-low backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-4">
            <IconSelect
              label="Model"
              icon="model_training"
              items={AVAILABLE_MODELS.map(m => ({ value: m.id, label: `${m.label} (${m.size})` }))}
              value={selectedModel.id}
              onChange={handleModelChange}
              disabled={recorderState === 'processing'}
              className="flex-1"
            />
            <IconSelect
              label="Language"
              icon="translate"
              items={selectedModel.languages.map(lang => ({ value: lang, label: lang.toUpperCase() }))}
              value={language}
              onChange={setLanguage}
              disabled={recorderState === 'processing'}
              className="flex-1"
            />
            <IconSelect
              label="Granularity"
              icon="select_all"
              items={selectedModel.timestampGranularity.map(gran => ({ value: gran, label: gran }))}
              value={timestampGranularity}
              onChange={setTimestampGranularity}
              disabled={recorderState === 'processing'}
              className="flex-1"
            />
          </div>
        </div>

        {/* Recording Card (compact) */}
        <div className="bg-surface-container-lowest/40 backdrop-blur-md rounded-2xl p-6 space-y-4">
          {/* Status / Waveform */}
          <div className="flex flex-col items-center gap-4">
            {recorderState === 'recording' ? (
              <>
                {/* Animated waveform */}
                <div className="flex items-center gap-1 h-12">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-primary rounded-full animate-waveform"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium">Recording...</span>
                </div>
              </>
            ) : recorderState === 'processing' ? (
              <>
                {/* Loading spinner */}
                <div className="w-12 h-12 rounded-full border-2 border-secondary/20 border-t-secondary animate-spin" />
                <span className="text-xs text-on-surface-variant">Processing audio...</span>
              </>
            ) : (
              <>
                {/* Idle icon */}
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-outline">
                    mic
                  </span>
                </div>
                <span className="text-xs text-outline">
                  {isModelReady ? "Ready to transcribe" : "Tap to start"}
                </span>
              </>
            )}
          </div>

          {/* Progress bars */}
          {modelProgress && recorderState === 'processing' ? (
            <div className="space-y-2">
              {fileProgress.length > 0 ? (
                fileProgress.map((fp) => (
                  <Progress key={fp.file} file={fp.file} progress={fp.progress} />
                ))
              ) : (
                <p className="text-[10px] text-outline text-center">
                  {modelProgress.status === "initiate"
                    ? "Initializing model..."
                    : modelProgress.status === "download"
                      ? "Downloading model..."
                      : modelProgress.status === "ready"
                        ? "Model ready!"
                        : "Loading..."}
                </p>
              )}
            </div>
          ) : null}

          {/* Live Transcription Streaming */}
          {isStreaming && streamingText ? (
            <div className="w-full bg-surface-container-low backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-semibold text-primary uppercase">Live</span>
              </div>
              <p className="text-xs text-on-surface whitespace-pre-wrap leading-relaxed">
                {streamingText}<span className="inline-block w-1 h-3 ml-0.5 bg-primary/70 animate-pulse align-middle" />
              </p>
            </div>
          ) : null}

          {/* Record/Stop button */}
          <div className="flex flex-col items-center gap-3">
            {/* Selected file name */}
            {selectedFileName ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container text-xs text-on-surface-variant max-w-full truncate">
                <span className="material-symbols-outlined text-sm text-secondary">audio_file</span>
                <span className="truncate">{selectedFileName}</span>
              </div>
            ) : null}

            <div className="flex items-center gap-2 w-full">
              {recorderState === 'recording' ? (
                <button
                  onClick={stopRecording}
                  className="flex-1 py-3 bg-error/10 hover:bg-error/20 text-error rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm"
                >
                  <span className="material-symbols-outlined text-lg">stop</span>
                  Stop
                </button>
              ) : (
                <>
                  <button
                    onClick={startRecording}
                    disabled={recorderState === 'processing'}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl flex items-center justify-center gap-1.5 font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    title="Record from Microphone"
                  >
                    <span className="material-symbols-outlined text-lg">mic</span>
                    Mic
                  </button>

                 

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={recorderState === 'processing'}
                    className="py-3 px-4 bg-surface-container-high hover:bg-surface-bright rounded-xl flex items-center justify-center gap-1.5 text-on-surface-variant transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    title="Upload audio file"
                  >
                    <span className="material-symbols-outlined text-lg">upload</span>
                  </button>
                </>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Format hint */}
            {recorderState === 'idle' && (
              <p className="text-[9px] text-outline text-center">
                Supports MP3, WAV, WebM, OGG, FLAC, AAC
              </p>
            )}
          </div>
        </div>

        {/* Transcription result */}
        {transcription ? (
          <TranscriptionDisplay
            result={transcription}
            granularity={timestampGranularity}
            onDownload={downloadTranscription}
          />
        ) : null}

        {/* Error display */}
        {error && (
          <div className="bg-error/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-error text-sm">error</span>
              <span className="text-xs font-semibold text-error">Error</span>
            </div>
            <p className="text-[10px] text-on-surface-variant">{error}</p>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}