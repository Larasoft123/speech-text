"use client";

import type { IconName } from "../../shared/types";

type FeatureVariant = "transcription" | "translation" | "tts";

interface FeatureCardProps {
  variant: FeatureVariant;
  title: string;
  description: string;
  preview?: React.ReactNode;
  className?: string;
}

const variantConfig: Record<
  FeatureVariant,
  {
    icon: IconName;
    iconColor: string;
    bgColor: string;
    hoverBgColor: string;
    hoverTextColor: string;
  }
> = {
  transcription: {
    icon: "description",
    iconColor: "primary",
    bgColor: "primary/10",
    hoverBgColor: "primary",
    hoverTextColor: "on-primary",
  },
  translation: {
    icon: "translate",
    iconColor: "secondary",
    bgColor: "secondary/10",
    hoverBgColor: "secondary",
    hoverTextColor: "on-secondary",
  },
  tts: {
    icon: "record_voice_over",
    iconColor: "tertiary",
    bgColor: "tertiary/10",
    hoverBgColor: "tertiary",
    hoverTextColor: "on-tertiary",
  },
};

export function FeatureCard({
  variant,
  title,
  description,
  preview,
  className = "",
}: FeatureCardProps) {
  const config = variantConfig[variant];

  return (
    <div className={`space-y-6 group ${className}`}>
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl bg-${config.bgColor} flex items-center justify-center text-${config.iconColor} group-hover:bg-${config.hoverBgColor} group-hover:text-${config.hoverTextColor} transition-all duration-500`}>
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {config.icon}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold tracking-tight">{title}</h3>

      {/* Description */}
      <p className="text-on-surface-variant leading-relaxed">{description}</p>

      {/* Preview */}
      {preview && <div className="pt-4">{preview}</div>}
    </div>
  );
}

// Preview components for each feature type
export function TranscriptionPreview() {
  return (
    <div className="flex items-center space-x-2 text-xs font-mono text-primary opacity-60">
      <span>[00:04:12]</span>
      <span className="h-px flex-1 bg-outline-variant/20"></span>
      <span>Speaker A</span>
    </div>
  );
}

export function TranslationPreview() {
  const languages = ["Mandarin", "Arabic", "French"];
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((lang) => (
        <span key={lang} className="px-3 py-1 rounded-full bg-surface-container text-[10px] uppercase tracking-wider font-bold">
          {lang}
        </span>
      ))}
    </div>
  );
}

export function TTSPreview() {
  return (
    <div className="h-8 bg-surface-container rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-tertiary/20 to-transparent w-full animate-[shimmer_2s_infinite]" />
    </div>
  );
}

interface FeaturesSectionProps {
  features?: Array<{
    variant: FeatureVariant;
    title: string;
    description: string;
  }>;
}

export function FeaturesSection({
  features = [
    {
      variant: "transcription",
      title: "Precise Transcription",
      description:
        "Professional-grade audio-to-text with automated speaker labels and millisecond timecodes. Designed for high-stakes archival.",
    },
    {
      variant: "translation",
      title: "Global Translation",
      description:
        "Support for 120+ languages with contextual nuance preservation. Your discourse, adapted for every local frequency.",
    },
    {
      variant: "tts",
      title: "Natural TTS",
      description:
        "Hyper-realistic cloned voices that capture the ethereal essence of human emotion. Synthetic speech, felt naturally.",
    },
  ],
}: FeaturesSectionProps) {
  const previewMap: Record<FeatureVariant, React.ReactNode> = {
    transcription: <TranscriptionPreview />,
    translation: <TranslationPreview />,
    tts: <TTSPreview />,
  };

  return (
    <section className="bg-surface-container-lowest py-32">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
          {features.map((feature, index) => (
            <FeatureCard
              key={`feature-${feature.variant}-${index}`}
              variant={feature.variant}
              title={feature.title}
              description={feature.description}
              preview={previewMap[feature.variant]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
