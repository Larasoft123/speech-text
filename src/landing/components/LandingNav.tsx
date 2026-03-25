"use client";

interface NavLink {
  label: string;
  href: string;
}

interface LandingNavProps {
  logo?: string;
  navLinks?: NavLink[];
  onLoginClick?: () => void;
  onGetStartedClick?: () => void;
}

export function LandingNav({
  logo = "AetherVoice",
  navLinks = [],
  onLoginClick,
  onGetStartedClick,
}: LandingNavProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(229,43,80,0.04)]"
    >
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-xl font-bold tracking-tighter text-brand-primary">
          {logo}
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link, index) => (
            <a
              key={`landing-nav-${link.href}-${index}`}
              href={link.href}
              className="text-slate-400 font-['Inter'] text-sm tracking-tight hover:text-white transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onLoginClick}
            className="text-slate-400 font-['Inter'] text-sm tracking-tight hover:text-white transition-colors scale-95 duration-200"
          >
            Login
          </button>
          <button
            onClick={onGetStartedClick}
            className="bg-primary-container text-on-primary-container px-5 py-2 rounded-lg font-['Inter'] text-sm tracking-tight font-semibold hover:opacity-90 transition-all scale-95 duration-200"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
