import { EtherealGrid } from "./EtherealGrid";


export function TranscriptionPreview() {
  return (
    <div className="flex items-center space-x-2 text-xs font-mono text-primary opacity-60">
      <span className="material-symbols-outlined text-[14px]">schedule</span>
      <span>[00:04:12]</span>
      <span className="flex-1"></span>
      <span>Speaker A</span>
    </div>
  );
}

export function TranslationPreview() {
  const languages = ["Mandarin", "Arabic", "French"];
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((lang) => (
        <span key={lang} className="px-3 py-1 rounded-full bg-surface-container-highest/60 text-[10px] uppercase tracking-wider font-bold">
          {lang}
        </span>
      ))}
    </div>
  );
}

export function TTSPreview() {
  return (
    <div className="h-4 bg-surface-container-highest/60 rounded-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-tertiary/20 via-tertiary/40 to-transparent w-full animate-[shimmer_2s_infinite]" />
    </div>
  );
}


const features = [
  {
    title: "Precise Transcription",
    description:
      "Professional-grade audio-to-text with automated speaker labels and millisecond timecodes. Designed for high-stakes archival.",
    icon: "description",
    footer: <TranscriptionPreview />
  },
  {
    title: "Global Translation",
    description:
      "Support for 120+ languages with contextual nuance preservation. Your discourse, adapted for every local frequency.",
    icon: "translate",
    footer: <TranslationPreview />
  },
  {
    title: "Natural TTS",
    description:
      "Hyper-realistic cloned voices that capture the ethereal essence of human emotion. Synthetic speech, felt naturally.",
    icon: "record_voice_over",
    footer: <TTSPreview />
  },
]


export function FeaturesSection() {
  return (
    <section className="bg-surface-container-lowest py-40">
      <div className="max-w-7xl mx-auto px-8">
        
        <EtherealGrid
        inverted
          items={features}
          columns={3}
          className="gap-24"
        />
      </div>
    </section>
  );
}
