"use client";

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

export function CTASection({
  title = "Experience the Ethereal Tool",
  description = "Join the vanguard of global discourse. Start your creative workflow today with our professional AI suite.",
  buttonLabel = "Launch AetherVoice",
  onButtonClick,
}: CTASectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-8 py-32">
      <div
        className="
          relative overflow-hidden
          bg-surface-container
          rounded-[2rem] p-16 md:p-24
          text-center
        "
      >
        {/* Background Glow */}
        <div className="absolute inset-0 ethereal-glow opacity-40" />

        <div className="relative z-10">
          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
            {title}
          </h2>

          {/* Description */}
          <p className="text-lg text-on-surface-variant mb-12 max-w-xl mx-auto font-light">
            {description}
          </p>

          {/* CTA Button */}
          <button
            onClick={onButtonClick}
            className="
              bg-white text-surface-dim
              px-12 py-5 rounded-full
              font-black text-lg
              hover:scale-105 transition-transform
            "
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
