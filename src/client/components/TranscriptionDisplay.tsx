"use client";

import type { TranscriptionResult, TimestampGranularity } from "@/client/lib/client-transcriber";

interface TranscriptionDisplayProps {
  result: TranscriptionResult;
  granularity: TimestampGranularity;
  onDownload: () => void;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  }
  return `${secs}.${ms.toString().padStart(2, "0")}`;
}

function formatDuration(start: number, end: number): string {
  return `${formatTimestamp(start)} → ${formatTimestamp(end)}`;
}

export function TranscriptionDisplay({
  result,
  granularity,
  onDownload,
}: TranscriptionDisplayProps) {
  const itemCount = result.chunks.length;
  const isWordLevel = granularity === "word";
  const itemLabel = isWordLevel ? "words" : "segments";

  return (
    <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-2xl border border-outline-variant/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-xl">
            {isWordLevel ? "text_fields" : "segment"}
          </span>
          <span className="text-sm font-semibold text-slate-200">Transcription</span>
          {itemCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest">
              {itemCount} {itemLabel}
            </span>
          )}
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-surface-container-high hover:bg-surface-bright
                     text-slate-300 text-xs font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Download .txt
        </button>
      </div>

      {/* Plain text result */}
      <div className="px-6 py-5 border-b border-outline-variant/10">
        <p className="text-base text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
          {result.text}
        </p>
      </div>

      {/* Word-level timestamps */}
      {result.chunks.length > 0 ? (
        <div className="px-6 py-5 max-h-96 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>{isWordLevel ? "Word-level" : "Phrase-level"} timestamps</span>
            <span className="text-slate-700">|</span>
            <span>start → end</span>
          </div>

          <div className="space-y-1">
            {result.chunks.map((chunk, i) => (
              <div
                key={i}
                className="group flex items-baseline gap-3 py-1 px-3 rounded-lg
                           hover:bg-surface-container-low transition-colors"
              >
                {/* Index */}
                <span className="text-[10px] text-slate-600 w-6 text-right shrink-0">
                  {i + 1}
                </span>

                {/* Word */}
                <span className="text-sm text-slate-200 font-medium min-w-0">
                  {chunk.text}
                </span>

                {/* Timestamp */}
                <span className="ml-auto shrink-0 text-xs font-mono text-primary/70
                                  group-hover:text-primary transition-colors">
                  {formatDuration(chunk.timestamp[0], chunk.timestamp[1])}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-6 py-5">
          <p className="text-xs text-slate-500 italic">
            {isWordLevel
              ? "Word timestamps not available for this audio."
              : "Phrase timestamps not available for this audio."}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-surface-container-lowest flex items-center justify-between text-[10px] text-slate-600 uppercase tracking-widest">
        <span>Processed locally in your browser</span>
        <span>Whisper q8 • WASM • {isWordLevel ? "word-level" : "phrase-level"}</span>
      </div>
    </div>
  );
}
