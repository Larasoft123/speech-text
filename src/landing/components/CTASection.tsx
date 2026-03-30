import { Button } from "@/shared/components/Button";


export function CTASection() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-32">
      <div className="relative overflow-hidden bg-surface-container rounded-3xl p-16 md:p-24 text-center">
        {/* Background Glow */}
        <div className="absolute inset-0 ethereal-glow opacity-40" />

        <div className="relative z-10">
          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
            Experience the Tool
          </h2>

          {/* Description */}
          <p className="text-lg text-on-surface-variant mb-12 max-w-xl mx-auto font-light">
            Start your creative workflow today with us
          </p>

          {/* CTA Button */}
          <Button
            href="/local-features"
            variant="primary"
            size="lg"
            aria-label="Launch OpenVoice"
            className="rounded-full"
          >
            Launch OpenVoice
          </Button>
        </div>
      </div>
    </section>
  );
}
