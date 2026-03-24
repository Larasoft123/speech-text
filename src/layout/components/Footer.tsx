"use client";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  copyright?: string;
  links?: FooterLink[];
  sidebarWidth?: number;
}

export function Footer({
  copyright = "© 2024 AetherVoice AI • Ethereal Tool v2.0",
  links = [],
  sidebarWidth = 256,
}: FooterProps) {
  return (
    <footer
      className="
        fixed bottom-0 right-0
        h-10
        bg-surface-container-lowest
        flex justify-between items-center
        px-12
        border-t border-outline-variant/10
        z-40
      "
      style={{ width: `calc(100% - ${sidebarWidth}px)` }}
    >
      {/* Copyright */}
      <div className="text-[10px] uppercase tracking-widest text-slate-500">
        {copyright}
      </div>

      {/* Links */}
      <div className="flex gap-6">
        {links.map((link, index) => (
          <a
            key={`footer-link-${link.href}-${index}`}
            href={link.href}
            className="
              text-[10px] uppercase tracking-widest
              text-slate-600 hover:text-brand-primary
              transition-colors
            "
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
