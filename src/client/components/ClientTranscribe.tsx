"use client";

import { type WhisperModel, type TimestampGranularity, AVAILABLE_MODELS } from "@/client/lib/client-transcriber";
import { TranscriptionColumn } from "@/client/components/TranscriptionColumn";
import { GenerationColumn } from "@/client/components/GenerationColumn";
import { useState } from "react";
import {  type LanguageCode } from "@/shared/components/LanguageSelect";




export function ClientTranscribe() {
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

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-xl">mic</span>
            <span className="material-symbols-outlined text-secondary text-xl">volume_up</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            Speech & Text Tools
          </span>
          <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest">
            Browser Inference
          </span>
        </div>
      </header>

      {/* Main content - Side by side columns */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* Left column: Transcription */}
        <TranscriptionColumn
          selectedModel={selectedModel}
          timestampGranularity={timestampGranularity}
          language={language}
          onModelChange={handleModelChange}
          onLanguageChange={setLanguage}
          onGranularityChange={setTimestampGranularity}
          availableModels={AVAILABLE_MODELS}
          availableLanguages={selectedModel.languages}
          availableGranularities={selectedModel.timestampGranularity}
        />

        {/* Right column: Audio Generation */}
        <GenerationColumn />
      </main>
    </div>
  );
}