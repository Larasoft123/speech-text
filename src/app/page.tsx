"use client";

import { LandingNav } from "@/landing/components/LandingNav";
import { HeroSection } from "@/landing/components/HeroSection";
import { FeaturesSection } from "@/landing/components/FeatureCard";
import { StepsSection } from "@/landing/components/StepsSection";
import { CTASection } from "@/landing/components/CTASection";
import { LandingFooter } from "@/landing/components/LandingFooter";

// Datos fuera del componente para evitar recreacion en cada render
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const FOOTER_LINKS = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "API Documentation", href: "#" },
  { label: "Contact Support", href: "#" },
  { label: "Status", href: "#" },
];

// Handlers estables
const handleLoginClick = () => console.log("Login clicked");
const handleGetStartedClick = () => console.log("Get Started clicked");
const handlePrimaryClick = () => console.log("Start Recording clicked");
const handleSecondaryClick = () => console.log("Watch Demo clicked");
const handleButtonClick = () => console.log("Launch clicked");

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <LandingNav
        navLinks={NAV_LINKS}
        onLoginClick={handleLoginClick}
        onGetStartedClick={handleGetStartedClick}
      />

      {/* Main Content */}
      <main className="relative pt-32 overflow-hidden">
        {/* Hero Section */}
        <HeroSection
          onPrimaryClick={handlePrimaryClick}
          onSecondaryClick={handleSecondaryClick}
        />

        {/* Features Section */}
        <div id="features">
          <FeaturesSection />
        </div>

        {/* How it Works Section */}
        <StepsSection />

        {/* CTA Section */}
        <CTASection onButtonClick={handleButtonClick} />
      </main>

      {/* Footer */}
      <LandingFooter links={FOOTER_LINKS} />
    </div>
  );
}
