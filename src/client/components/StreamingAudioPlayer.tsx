import { useState, useEffect } from "react";

interface StreamingAudioPlayerProps {
  isStreaming: boolean;
  streamingProgress: { current: number; total: number } | null;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  streamingStartTime: number | null;
  generatedAudio: { audioUrl: string; samplingRate: number; audioData: Float32Array } | null;
  stopStreaming: () => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  downloadAudio: () => void;
}

export function StreamingAudioPlayer({
  isStreaming,
  streamingProgress,
  isPlaying,
  currentTime,
  totalDuration,
  streamingStartTime,
  generatedAudio,
  stopStreaming,
  pausePlayback,
  resumePlayback,
  downloadAudio,
}: StreamingAudioPlayerProps) {
  const [currentRTF, setCurrentRTF] = useState(0);

  // Helper to format time in seconds to mm:ss.SS
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return "0:00.00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(2, "0")}`;
  };

  // RTF Update effect
  useEffect(() => {
    const updateRTF = () => {
      if (!streamingStartTime || totalDuration <= 0) {
        setCurrentRTF(prev => prev === 0 ? 0 : 0);
        return;
      }
      const processingTimeSec = (Date.now() - streamingStartTime) / 1000;
      setCurrentRTF(processingTimeSec / totalDuration);
    };

    // If still streaming, update periodically for live feedback
    if (isStreaming && streamingStartTime && totalDuration > 0) {
      updateRTF(); // Initial update when streaming starts or totalDuration is available
      const interval = setInterval(updateRTF, 200);
      return () => clearInterval(interval);
    } else if (!isStreaming) {
      // Refresh value once when streaming stops to show final RTF
      updateRTF();
    }
  }, [streamingStartTime, totalDuration, isStreaming]);

  if (!isStreaming && totalDuration <= 0) {
    return null;
  }

  return (
    <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-2xl p-6 border border-outline-variant/10 space-y-4">
      {/* Streaming Progress Bar */}
      {isStreaming && streamingProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-300">
            <span>
              Generating... (
              {Math.round(
                (streamingProgress.current / streamingProgress.total) * 100
              )}
              %)
            </span>
            <button
              onClick={stopStreaming}
              className="p-1 rounded-lg bg-error/20 text-error hover:bg-error/30 transition-colors"
              title="Stop streaming"
            >
              <span className="material-symbols-outlined text-lg">stop</span>
            </button>
          </div>
          <div className="w-full bg-surface-container-lowest rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (streamingProgress.current / streamingProgress.total) * 100
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Audio Player Controls */}
      <div className="flex items-center gap-4">
        {/* RTF Display */}
        <div className="text-xs text-slate-400 w-16">
          {currentRTF.toFixed(3)}x<br />
          <span className="text-[10px]">RTF ↓</span>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? pausePlayback : resumePlayback}
          className="p-3 rounded-full bg-surface-container-high hover:bg-surface-bright text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>

        {/* Time Display */}
        <div className="flex-1">
          <div className="flex justify-between text-sm text-slate-300 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-container-lowest rounded-full h-1 mt-1">
            <div
              className="bg-blue-400 h-1 rounded-full transition-all duration-200"
              style={{
                width: `${
                  totalDuration > 0
                    ? (currentTime / totalDuration) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Download Button (when not streaming) */}
        {!isStreaming && generatedAudio && (
          <button
            onClick={downloadAudio}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-slate-300 transition-colors"
            title="Download audio"
          >
            <span className="material-symbols-outlined text-lg">download</span>
          </button>
        )}
      </div>
    </div>
  );
}
