"use client";

import { ReactNode } from "react";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function DashboardHero({
  title = "Welcome to the Lab",
  subtitle = "Upload your media or start a live recording to begin your editorial journey.",
  children,
  className = "",
}: HeroSectionProps) {
  return (
    <section className={`relative mb-20 ${className}`}>
      {/* Background Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />

      {/* Text */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 mb-3">
          {title}
        </h1>
        <p className="text-slate-400 max-w-md mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Additional Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </section>
  );
}
