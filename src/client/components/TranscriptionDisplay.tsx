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
    <div className="bg-surface-container-low backdrop-blur-sm rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface-container/30">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-xl">
            {isWordLevel ? "text_fields" : "segment"}
          </span>
          <span className="text-sm font-semibold text-on-surface">Transcription</span>
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
                     text-on-surface-variant text-xs font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Download .txt
        </button>
      </div>

      {/* Plain text result */}
      <div className="px-6 py-5">
        <p className="text-base text-on-surface leading-relaxed font-medium whitespace-pre-wrap">
          {result.text}
        </p>
      </div>

      {/* Word-level timestamps */}
      {result.chunks.length > 0 ? (
        <div className="px-6 py-5 max-h-96 overflow-y-auto bg-surface-container-lowest/30">
          <div className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>{isWordLevel ? "Word-level" : "Phrase-level"} timestamps</span>
            <span className="text-outline-variant">|</span>
            <span>start → end</span>
          </div>

          <div className="space-y-1">
            {result.chunks.map((chunk, i) => (
              <div
                key={i}
                className="group flex items-baseline gap-3 py-1 px-3 rounded-lg
                           hover:bg-surface-container transition-colors"
              >
                {/* Index */}
                <span className="text-[10px] text-outline w-6 text-right shrink-0">
                  {i + 1}
                </span>

                {/* Word */}
                <span className="text-sm text-on-surface font-medium min-w-0">
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
          <p className="text-xs text-on-surface-variant/60 italic">
            {isWordLevel
              ? "Word timestamps not available for this audio."
              : "Phrase timestamps not available for this audio."}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-surface-container-lowest flex items-center justify-between text-[10px] text-outline uppercase tracking-widest">
        <span>Processed locally in your browser</span>
        <span>Whisper q8 • WASM • {isWordLevel ? "word-level" : "phrase-level"}</span>
      </div>
    </div>
  );
}
