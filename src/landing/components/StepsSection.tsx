import { EtherealGrid } from "./EtherealGrid";

interface Step {
  title: string;
  description: string;
  icon: string;
}

interface StepsSectionProps {
  eyebrow?: string;
  title?: string;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  {
    title: "Upload",
    description: "Ingestion of your raw masters or field recordings.",
    icon: "cloud_upload"
  },
  {
    title: "Edit",
    description: "Refine text and timestamps with our interface.",
    icon: "edit_square"
  },
  {
    title: "Translate",
    description: "Instant linguistic mapping with AI models.",
    icon: "translate"
  },
  {
    title: "Synthesize",
    description: "Export cloned audio in any destination language.",
    icon: "waves"
  },
];

export function StepsSection({
  eyebrow = "The Workflow",
  title = "From Capture to Synthesis",
  steps = defaultSteps,
}: StepsSectionProps) {
  return (
    <section id="steps" className="py-40 relative overflow-hidden bg-surface-container-low/20">
      {/* Dynamic Background Layering */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-outline-variant/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Header */}
        <header className="mb-24 text-center">
          <span className="text-primary font-bold tracking-[0.4em] uppercase text-[10px] mb-6 block opacity-80">
            {eyebrow}
          </span>
          <h2 className="text-5xl font-black tracking-tighter text-on-surface max-w-2xl mx-auto leading-[1.1]">
            {title}
          </h2>
        </header>

        {/* Modular Ethereal Grid */}
        <EtherealGrid items={steps} showNumbers columns={4} />
      </div>
    </section>
  );
}
