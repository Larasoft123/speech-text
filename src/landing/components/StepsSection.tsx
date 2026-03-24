"use client";

interface Step {
  number: number;
  title: string;
  description: string;
  color: string;
}

interface StepsSectionProps {
  eyebrow?: string;
  title?: string;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  {
    number: 1,
    title: "Upload",
    description: "Lossless ingestion of your raw masters or field recordings.",
    color: "primary",
  },
  {
    number: 2,
    title: "Edit",
    description: "Refine text and timestamps with our editorial-grade interface.",
    color: "secondary",
  },
  {
    number: 3,
    title: "Translate",
    description: "Instant linguistic mapping with specialized AI models.",
    color: "tertiary",
  },
  {
    number: 4,
    title: "Synthesize",
    description: "Export high-fidelity cloned audio in any destination language.",
    color: "white",
  },
];

const colorMap: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  white: "text-white",
};

export function StepsSection({
  eyebrow = "The Workflow",
  title = "From Capture to Synthesis",
  steps = defaultSteps,
}: StepsSectionProps) {
  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-24">
          <span className="text-brand-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
            {eyebrow}
          </span>
          <h2 className="text-4xl font-black tracking-tight">{title}</h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line - Vertical on mobile, Horizontal on desktop */}
          <div
            className="
              absolute left-8 top-0 bottom-0 w-px
              bg-gradient-to-b from-primary/40 via-secondary/40 to-tertiary/40
              md:left-0 md:right-0 md:h-px md:w-full md:top-12
              md:bg-gradient-to-r
            "
          />

          {/* Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step) => (
              <div key={`step-${step.number}`} className="bg-surface p-8 pt-0 md:pt-20">
                {/* Step Number */}
                <div
                  className="
                    w-12 h-12 rounded-full
                    bg-surface border-4 border-surface-container-high
                    flex items-center justify-center
                    font-black mb-6
                    ${colorMap[step.color]}
                  "
                >
                  {step.number}
                </div>

                {/* Title */}
                <h4 className="font-bold mb-3">{step.title}</h4>

                {/* Description */}
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
