"use client";

import { Icon } from "@/shared/components/Icon";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";

interface WaveformBar {
  height: number;
  opacity: number;
}

interface LiveSessionCardProps {
  title?: string;
  description?: string;
  badgeLabel?: string;
  buttonLabel?: string;
  onStartRecording?: () => void;
  className?: string;
}

const defaultWaveform: WaveformBar[] = [
  { height: 25, opacity: 0.2 },
  { height: 50, opacity: 0.4 },
  { height: 75, opacity: 0.6 },
  { height: 37, opacity: 0.4 },
  { height: 62, opacity: 0.8 },
  { height: 25, opacity: 0.3 },
  { height: 50, opacity: 0.5 },
  { height: 37, opacity: 0.35 },
];

export function LiveSessionCard({
  title = "Capture Voice",
  description = "Professional studio-grade transcription in real-time with speaker identification.",
  badgeLabel = "Live Session",
  buttonLabel = "Start Recording",
  onStartRecording,
  className = "",
}: LiveSessionCardProps) {
  return (
    <div
      className={`
        bg-surface-container-lowest/40
        backdrop-blur-md
        rounded-[2rem]
        p-8
        border border-outline-variant/10
        flex flex-col justify-between
        ${className}
      `}
    >
      {/* Header */}
      <div>
        <Badge variant="secondary" className="mb-4">
          {badgeLabel}
        </Badge>

        <h3 className="text-2xl font-bold text-slate-100 mb-2">
          {title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Waveform Visualization */}
      <div className="relative py-12 flex items-center justify-center">
        {/* Bars */}
        <div className="flex items-center gap-1.5 h-16">
          {defaultWaveform.map((bar, index) => (
            <div
              key={index}
              className="w-1.5 rounded-full animate-pulse"
              style={{
                height: `${bar.height}%`,
                backgroundColor: `rgba(255, 178, 183, ${bar.opacity})`,
                animationDelay: `${index * 100}ms`,
              }}
            />
          ))}
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-50" />
      </div>

      {/* CTA Button */}
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        icon="mic"
        iconPosition="left"
        onClick={onStartRecording}
        className="hover:bg-primary/10 hover:text-primary group"
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
