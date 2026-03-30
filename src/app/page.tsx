import { HeroSection } from "@/landing/components/HeroSection";
import { FeaturesSection } from "@/landing/components/FeatureCard";
import { LocalFocusSection } from "@/landing/components/LocalFeatures";
import { StepsSection } from "@/landing/components/StepsSection";
import { CTASection } from "@/landing/components/CTASection";
import { LandingFooter } from "@/landing/components/LandingFooter";



export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <a href="#main" className="absolute top-0 left-0 z-100 p-3 m-3 -translate-y-[150%] focus:translate-y-0 transition-transform bg-primary text-on-primary font-bold rounded-lg shadow-ambient">
        Skip to main content
      </a>

     

      {/* Main Content */}
      <main id="main" className="relative pt-32 overflow-hidden">
        {/* Hero Section */}
        <HeroSection />

        {/* Local Focus Capabilities */}
        <LocalFocusSection />

        {/* Features Section */}
        <div id="features">
          <FeaturesSection />
        </div>

        {/* How it Works Section */}
        <StepsSection />

        {/* CTA Section */}
        <CTASection />
      </main>

      {/* Footer */}
      <LandingFooter  />
    </div>
  );
}
