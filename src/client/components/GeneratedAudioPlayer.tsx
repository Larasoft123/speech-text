interface GeneratedAudioPlayerProps {
  generatedAudio: {
    audioUrl: string;
    samplingRate: number;
    audioData: Float32Array;
  } | null;
  modelLabel: string;
  downloadAudio: () => void;
  clearAudio: () => void;
}

export function GeneratedAudioPlayer({
  generatedAudio,
  modelLabel,
  downloadAudio,
  clearAudio,
}: GeneratedAudioPlayerProps) {
  if (!generatedAudio) return null;

  return (
    <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-2xl p-6 border border-outline-variant/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-xl">
            audio_file
          </span>
          <span className="text-sm font-semibold text-slate-200">
            Generated Audio
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadAudio}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-slate-300 transition-colors"
            title="Download audio"
          >
            <span className="material-symbols-outlined text-lg">download</span>
          </button>
          <button
            onClick={clearAudio}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-slate-300 transition-colors"
            title="Clear audio"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      <audio controls src={generatedAudio.audioUrl} className="w-full h-10" />

      <p className="text-[10px] text-slate-500 text-center">
        {generatedAudio.samplingRate} Hz • {modelLabel}
      </p>
    </div>
  );
}
