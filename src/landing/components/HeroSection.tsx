"use client";

import { Button } from "@/shared/components/Button";

interface WaveformBar {
  height: number;
  opacity: number;
  delay?: string;
}

interface WaveformVizProps {
  bars?: WaveformBar[];
  className?: string;
}

const defaultBars: WaveformBar[] = [
  { height: 37.5, opacity: 1, delay: "0s" },
  { height: 75, opacity: 1, delay: "0.2s" },
  { height: 100, opacity: 1, delay: "0.4s" },
  { height: 50, opacity: 1, delay: "0.1s" },
  { height: 87.5, opacity: 1, delay: "0.3s" },
  { height: 62.5, opacity: 1, delay: "0.5s" },
  { height: 43.75, opacity: 1, delay: "0.2s" },
];

export function WaveformViz({
  bars = defaultBars,
  className = "",
}: WaveformVizProps) {
  return (
    <div
      className={`
        flex items-end space-x-1.5 h-32
        ${className}
      `}
    >
      {bars.map((bar, index) => (
        <div
          key={`waveform-${index}`}
          className="w-1.5 bg-primary animate-pulse rounded-full"
          style={{
            height: `${bar.height}%`,
            animationDelay: bar.delay,
            backgroundColor: `rgba(255, 178, 183, ${bar.opacity})`,
          }}
        />
      ))}
    </div>
  );
}

interface UIPreviewCardProps {
  title?: string;
  subtitle?: string;
  progress?: number;
  className?: string;
}

export function UIPreviewCard({
  title = "Real-time Sync",
  subtitle,
  progress = 66,
  className = "",
}: UIPreviewCardProps) {
  return (
    <div
      className={`
        glass-panel p-4 rounded-xl
        shadow-2xl scale-90
        border border-outline-variant/20
        ${className}
      `}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">
          {title}
        </span>
      </div>
      <div className="h-2 w-32 bg-surface-container-low rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {subtitle && (
        <span className="text-[8px] text-slate-500 mt-1 block">{subtitle}</span>
      )}
    </div>
  );
}

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export function HeroSection({
  title = "Globalize Your Discourse with AI Precision",
  subtitle = "Transcription, translation, and TTS in one seamless workflow. Experience the ethereal boundary between human thought and digital expression.",
  primaryCtaLabel = "Start Your Recording",
  secondaryCtaLabel = "Watch Demo",
  onPrimaryClick,
  onSecondaryClick,
}: HeroSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-8 mb-32 relative pt-32">
      {/* Background Glow */}
      <div className="ethereal-glow absolute -top-40 -left-20 w-[600px] h-[600px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Content */}
        <div className="lg:col-span-7 z-10">
          {/* Title */}
          <h1
            className="
              text-5xl lg:text-7xl font-extrabold tracking-tighter
              leading-[1.05] mb-8
              bg-gradient-to-br from-white via-white to-slate-500
              bg-clip-text text-transparent
            "
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-on-surface-variant font-light leading-relaxed max-w-2xl mb-12">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-6">
            <button
              onClick={onPrimaryClick}
              className="
                bg-gradient-to-r from-primary-container to-inverse-primary
                text-on-primary-container
                px-8 py-4 rounded-xl font-bold tracking-tight
                hover:scale-105 transition-transform
              "
            >
              {primaryCtaLabel}
            </button>
            <button
              onClick={onSecondaryClick}
              className="
                flex items-center space-x-3
                bg-surface-container-highest px-8 py-4 rounded-xl
                font-semibold hover:bg-surface-bright transition-colors
              "
            >
              <span className="material-symbols-outlined text-xl">play_circle</span>
              <span>{secondaryCtaLabel}</span>
            </button>
          </div>
        </div>

        {/* Right Visual */}
        <div className="lg:col-span-5 relative">
          {/* Main Circle */}
          <div
            className="
              aspect-square glass-panel rounded-full
              flex items-center justify-center p-8
              relative overflow-hidden group
            "
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 opacity-50" />
            <WaveformViz />
          </div>

          {/* Preview Card */}
          <UIPreviewCard className="absolute -bottom-8 -left-8" />
        </div>
      </div>
    </section>
  );
}
