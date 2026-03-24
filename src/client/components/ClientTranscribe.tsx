"use client";

import {
  useTranscription,
  AVAILABLE_MODELS,
} from "@/client/hooks/useTranscription";
import type { WhisperModel, TimestampGranularity } from "@/client/hooks/useTranscription";
import { TranscriptionDisplay } from "@/client/components/TranscriptionDisplay";
import { AudioGeneratorPanel } from "@/client/components/AudioGeneratorPanel";
import { useState } from "react";
import { Progress } from "@/shared/components";
import { LanguageSelect, type LanguageCode } from "@/shared/components/LanguageSelect";

type TabType = "transcribe" | "generate";

export function ClientTranscribe() {
  const [activeTab, setActiveTab] = useState<TabType>("transcribe");
  const [selectedModel, setSelectedModel] = useState<WhisperModel>(AVAILABLE_MODELS[2]);
  const [timestampGranularity, setTimestampGranularity] = useState<TimestampGranularity>("word");
  const [language, setLanguage] = useState<LanguageCode>(selectedModel.languages[0]);

  const {
    recorderState,
    modelProgress,
    fileProgress,
    transcription,
    error,
    isModelReady,
    selectedFileName,
    fileInputRef,
    startRecording,
    startSystemRecording,
    stopRecording,
    handleFileChange,
    downloadTranscription,
    streamingText,
    isStreaming,
  } = useTranscription(selectedModel, timestampGranularity, language);

  const handleModelChange = (modelId: string) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (!model) return;
    setSelectedModel(model);
    // Reset language if current one isn't supported by new model
    if (!model.languages.includes(language)) {
      setLanguage(model.languages[0]);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">
            {activeTab === "transcribe" ? "mic" : "volume_up"}
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            {activeTab === "transcribe" ? "Client-Side Transcription" : "Audio Generation"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest">
            Browser Inference
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span>{selectedModel.label}</span>
          <span>•</span>
          <span>{selectedModel.size}</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex justify-center py-6 bg-surface/50 border-b border-outline-variant/10">
        <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl">
          <button
            onClick={() => setActiveTab("transcribe")}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "transcribe"
                ? "bg-primary text-on-primary"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">mic</span>
              Transcribe
            </span>
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "generate"
                ? "bg-primary text-on-primary"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">volume_up</span>
              Generate
            </span>
          </button>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-2xl space-y-8">
          {activeTab === "transcribe" ? (
            <>
              {/* Info Card */}
              <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-2xl p-6 border border-outline-variant/10">
                <h2 className="text-lg font-semibold text-slate-100 mb-2">
                  How it works
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  This page runs Whisper entirely in your browser — the audio never leaves your device.
                  The model (~150MB) downloads once and is cached for future sessions.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["No server required", "100% private", "Works offline (after first load)", "Record or upload audio"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Settings Card */}
              <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-2xl p-6 border border-outline-variant/10 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-xl">settings</span>
                  <span className="text-sm font-semibold text-slate-200">Transcription Settings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Model Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Model
                    </label>
                    <select
                      value={selectedModel.id}
                      onChange={(e) => handleModelChange(e.target.value)}
                      disabled={recorderState === "processing"}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {AVAILABLE_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label} ({m.size}) — {m.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Selector */}
                  <LanguageSelect
                    languages={selectedModel.languages}
                    value={language}
                    onChange={setLanguage}
                    disabled={recorderState === "processing"}
                  />

                  {/* Timestamp Granularity Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Timestamp Granularity
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setTimestampGranularity("word")}
                        disabled={recorderState === "processing"}
                        className={`py-3 px-4 rounded-xl text-xs font-semibold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${timestampGranularity === "word" ? "bg-primary/10 border-primary/30 text-primary" : "bg-surface-container-lowest border-outline-variant/10 text-slate-400 hover:text-slate-200 hover:border-outline-variant/30"}`}
                      >
                        <span className="material-symbols-outlined text-base block mb-1">text_fields</span>
                        Word
                      </button>
                      <button
                        onClick={() => setTimestampGranularity("phrase")}
                        disabled={recorderState === "processing"}
                        className={`py-3 px-4 rounded-xl text-xs font-semibold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${timestampGranularity === "phrase" ? "bg-primary/10 border-primary/30 text-primary" : "bg-surface-container-lowest border-outline-variant/10 text-slate-400 hover:text-slate-200 hover:border-outline-variant/30"}`}
                      >
                        <span className="material-symbols-outlined text-base block mb-1">segment</span>
                        Phrase
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Card */}
              <div className="bg-surface-container-lowest/40 backdrop-blur-md rounded-[2rem] p-10 border border-outline-variant/10 space-y-8">
                {/* Status / Waveform */}
                <div className="flex flex-col items-center gap-6">
                  {recorderState === "recording" ? (
                    <>
                      {/* Animated waveform */}
                      <div className="flex items-center gap-2 h-16">
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="w-2 bg-primary rounded-full animate-waveform"
                            style={{
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm font-medium">Recording...</span>
                      </div>
                    </>
                  ) : recorderState === "processing" ? (
                    <>
                      {/* Loading spinner */}
                      <div className="w-16 h-16 rounded-full border-2 border-secondary/20 border-t-secondary animate-spin" />
                      <span className="text-sm text-slate-400">Processing audio...</span>
                    </>
                  ) : (
                    <>
                      {/* Idle icon */}
                      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-4xl text-slate-500">
                          mic
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {isModelReady ? "Ready to transcribe" : "Tap to start"}
                      </span>
                    </>
                  )}
                </div>

                {/* Progress bars */}
                {modelProgress && recorderState === "processing" && (
                  <div className="space-y-3">
                    {fileProgress.length > 0 ? (
                      fileProgress.map((fp) => (
                        <Progress key={fp.file} file={fp.file} progress={fp.progress} />
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center">
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
                )}

                {/* Live Transcription Streaming */}
                {isStreaming && streamingText && (
                  <div className="w-full bg-surface/50 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 shadow-inner animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Live Transcription</span>
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed bg-clip-text">
                      {streamingText}<span className="inline-block w-1.5 h-4 ml-1 bg-primary/70 animate-pulse align-middle" />
                    </p>
                  </div>
                )}

                {/* Record/Stop button */}
                <div className="flex flex-col items-center gap-4">
                  {/* Selected file name */}
                  {selectedFileName && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-sm text-slate-300 max-w-xs truncate">
                      <span className="material-symbols-outlined text-base text-secondary">audio_file</span>
                      <span className="truncate">{selectedFileName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 w-full max-w-md">
                    {recorderState === "recording" ? (
                      <button
                        onClick={stopRecording}
                        className="flex-1 py-4 bg-error/10 hover:bg-error/20 text-error rounded-2xl flex items-center justify-center gap-3 transition-all font-bold border border-error/20"
                      >
                        <span className="material-symbols-outlined text-xl">stop</span>
                        Stop
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={startRecording}
                          disabled={recorderState === "processing"}
                          className="flex-1 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/10 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Record from Microphone"
                        >
                          <span className="material-symbols-outlined text-xl">mic</span>
                          Mic
                        </button>

                        <button
                          onClick={startSystemRecording}
                          disabled={recorderState === "processing"}
                          className="flex-1 py-4 bg-surface-container-high hover:bg-surface-bright rounded-2xl flex items-center justify-center gap-2 text-slate-200 font-bold transition-all border border-outline-variant/10 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Capture Tab/System Audio"
                        >
                          <span className="material-symbols-outlined text-xl">screen_share</span>
                          System
                        </button>
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={recorderState === "processing"}
                          className="py-4 px-5 bg-surface-container-high hover:bg-surface-bright rounded-2xl flex items-center justify-center gap-2 text-slate-300 transition-all border border-outline-variant/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Upload audio file"
                        >
                          <span className="material-symbols-outlined text-xl">upload</span>
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
                  {recorderState === "idle" && (
                    <p className="text-[10px] text-slate-600 text-center">
                      Supports MP3, WAV, WebM, OGG, FLAC, AAC
                    </p>
                  )}
                </div>
              </div>

              {/* Transcription result */}
              {transcription && (
                <TranscriptionDisplay
                  result={transcription}
                  granularity={timestampGranularity}
                  onDownload={downloadTranscription}
                />
              )}
            </>
          ) : (
            /* Generate Tab */
            <AudioGeneratorPanel />
          )}

          {/* Error */}
          {error && (
            <div className="bg-error/10 rounded-2xl p-6 border border-error/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-error text-xl">error</span>
                <span className="font-semibold text-error">Error</span>
              </div>
              <p className="text-sm text-slate-300">{error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
