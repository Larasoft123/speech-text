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
interface UIPreviewCardProps {
  title?: string;
  subtitle?: string;
  progress?: number;
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


const HERO_SECTION_CONTENT = {
  title: "Understand and create any voice in seconds",
  subtitle: "Capture, transcribe, translate, and synthesize speech in a few seconds.",
  primaryCtaLabel: "Start Your Recording",
  secondaryCtaLabel: "Try the features for free",
}


export function WaveformViz({
  bars = defaultBars,
  className = "",
}: WaveformVizProps) {
  return (
    <div className={`flex items-end space-x-1.5 h-32 ${className}`}>
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



export function UIPreviewCard({
  title = "Real-time Sync",
  subtitle,
  progress = 66,
  className = "",
}: UIPreviewCardProps) {
  return (
    <div className={`glass-panel p-4 rounded-xl shadow-glow-primary scale-90 ${className}`}>
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
        <span className="text-[8px] text-outline mt-1 block">{subtitle}</span>
      )}
    </div>
  );
}



export function HeroSection() {
  const { primaryCtaLabel, secondaryCtaLabel, subtitle, title } = HERO_SECTION_CONTENT


  return (
    <section className="max-w-7xl mx-auto px-8 mb-32 relative pt-32">
      {/* Background Glow */}
      <div className="ethereal-glow absolute -top-40 -left-20 w-[600px] h-[600px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Content */}
        <div className="lg:col-span-7 z-10">
          {/* Title */}
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05] mb-8 bg-gradient-to-br from-white via-white to-on-surface-variant bg-clip-text text-transparent">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-on-surface-variant font-light leading-relaxed max-w-2xl mb-12">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-6">
            <Button
              variant="primary"
              size="lg"
              disabled
         
              aria-label={primaryCtaLabel}
            >
              {primaryCtaLabel}
            </Button>


            <Button
              href="/local-features"
              variant="surface"
              size="lg"
              aria-label={secondaryCtaLabel}
            >
              {secondaryCtaLabel}
            </Button>
          </div>
        </div>

        {/* Right Visual */}
        <div className="lg:col-span-5 relative">
          {/* Main Circle */}
          <div className="aspect-square glass-panel rounded-full flex items-center justify-center p-8 relative overflow-hidden group">
            <div className="absolute inset-x-0 -bottom-24 h-96 bg-gradient-to-br from-primary/10 via-primary-container/10 to-transparent blur-3xl rounded-full opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/20 to-transparent" />
            <WaveformViz />
          </div>

          {/* Preview Card */}
          <UIPreviewCard className="absolute -bottom-8 -left-8" />
        </div>
      </div>
    </section>
  );
}
