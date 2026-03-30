import { useState, useEffect, useRef } from "react";

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
  onSeek?: (time: number) => void;
}

export function StreamingAudioPlayer({
  isStreaming,
  streamingProgress,
  isPlaying,
  currentTime,
  totalDuration,
  generatedAudio,
  stopStreaming,
  pausePlayback,
  resumePlayback,
  downloadAudio,
  onSeek,
}: StreamingAudioPlayerProps) {
  
  const [seekValue, setSeekValue] = useState(currentTime);
  const seekRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync seek value with currentTime
  useEffect(() => {
    if (!isStreaming) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isStreaming]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return "0:00.00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  

  // Handle seek change (during drag)
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSeekValue(value);
    // Call seek immediately while dragging for real-time feedback
    if (onSeek && !isStreaming) {
      onSeek(value);
    }
  }

  // Handle seek commit (on mouse up or touch end) - fallback for browsers that don't support onChange during drag
  const handleSeekCommit = () => {
    if (onSeek && !isStreaming) {
      onSeek(seekValue);
    }
  }

  // Handle native audio element seek (for generated audio)
  const handleAudioSeek = () => {
    if (audioRef.current && !isStreaming) {
      const time = audioRef.current.currentTime;
      setSeekValue(time);
      if (onSeek) {
        onSeek(time);
      }
    }
  }

  // Calculate progress percentage
  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const seekPercent = totalDuration > 0 ? (seekValue / totalDuration) * 100 : 0;

  if (!isStreaming && totalDuration <= 0) {
    return null;
  }

  return (
    <div className="bg-surface-container-low backdrop-blur-sm rounded-2xl p-6 space-y-4">
        {/* Streaming Progress Bar - Only during generation */}
        {isStreaming && streamingProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-on-surface">
              <span>
              Generating... (
              {streamingProgress.total > 0 
                ? Math.round((streamingProgress.current / streamingProgress.total) * 100)
                : 0}
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
                width: `${streamingProgress.total > 0 
                  ? (streamingProgress.current / streamingProgress.total) * 100 
                  : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Audio Player Controls */}
      <div className="flex items-center gap-4">
        
        <button
          onClick={isPlaying ? pausePlayback : resumePlayback}
          disabled={isStreaming}
          className="p-3 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-xl">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>

        {/* Time Display + Seek Bar */}
        <div className="flex-1">
          <div className="flex justify-between text-sm text-on-surface font-mono">
            <span>{formatTime(isStreaming ? currentTime : seekValue)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          {/* Single Seek Bar (acts as both progress and seek control) */}
          <div className="w-full mt-1">
            <input
              ref={seekRef}
              type="range"
              min="0"
              max={totalDuration || 0}
              step="0.01"
              value={isStreaming ? currentTime : seekValue}
              onChange={handleSeekChange}
              onMouseUp={handleSeekCommit}
              onTouchEnd={handleSeekCommit}
              disabled={isStreaming || totalDuration <= 0}
              className="w-full h-2 bg-surface-container-lowest rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${
                  isStreaming ? progressPercent : seekPercent
                }%, var(--surface-container-high) ${
                  isStreaming ? progressPercent : seekPercent
                }%, var(--surface-container-high) 100%)`,
              }}
            />
          </div>
        </div>

        {/* Download Button (when not streaming) */}
        {!isStreaming && generatedAudio && (
          <button
            onClick={downloadAudio}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors"
            title="Download audio"
          >
            <span className="material-symbols-outlined text-lg">download</span>
          </button>
        )}
      </div>

      {/* Hidden audio element for seek synchronization (non-streaming only) */}
      {generatedAudio && !isStreaming && (
        <audio
          ref={audioRef}
          src={generatedAudio.audioUrl}
          onSeeked={handleAudioSeek}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}
