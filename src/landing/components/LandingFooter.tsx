"use client";

interface FooterLink {
  label: string;
  href: string;
}

interface LandingFooterProps {
  logo?: string;
  copyright?: string;
  links?: FooterLink[];
}

export function LandingFooter({
  logo = "AetherVoice",
  copyright = "© 2024 AetherVoice AI. The Ethereal Tool for Global Discourse.",
  links = [],
}: LandingFooterProps) {
  return (
    <footer className="bg-surface-container-lowest w-full py-12 px-8">
      <div
        className="
          max-w-7xl mx-auto
          grid grid-cols-1 md:grid-cols-2 gap-8 items-center
          border-t border-outline-variant/20 pt-12
        "
      >
        {/* Logo & Copyright */}
        <div>
          <div className="text-lg font-black text-slate-200 mb-2">{logo}</div>
          <p className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500">
            {copyright}
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap md:justify-end gap-6">
          {links.map((link, index) => (
            <a
              key={`footer-${link.href}-${index}`}
              href={link.href}
              className="
                font-['Inter'] text-xs uppercase tracking-widest
                text-slate-500 hover:text-brand-primary
                transition-all opacity-80 hover:opacity-100
              "
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
