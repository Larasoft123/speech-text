"use client";

import {
  LandingNav,
  HeroSection,
  FeaturesSection,
  StepsSection,
  CTASection,
  LandingFooter,
} from "@/landing/components";

export default function LandingPage() {
  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
  ];

  const footerLinks = [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "API Documentation", href: "#" },
    { label: "Contact Support", href: "#" },
    { label: "Status", href: "#" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <LandingNav
        navLinks={navLinks}
        onLoginClick={() => console.log("Login clicked")}
        onGetStartedClick={() => console.log("Get Started clicked")}
      />

      {/* Main Content */}
      <main className="relative pt-32 overflow-hidden">
        {/* Hero Section */}
        <HeroSection
          onPrimaryClick={() => console.log("Start Recording clicked")}
          onSecondaryClick={() => console.log("Watch Demo clicked")}
        />

        {/* Features Section */}
        <div id="features">
          <FeaturesSection />
        </div>

        {/* How it Works Section */}
        <StepsSection />

        {/* CTA Section */}
        <CTASection onButtonClick={() => console.log("Launch clicked")} />
      </main>

      {/* Footer */}
      <LandingFooter links={footerLinks} />
    </div>
  );
}
