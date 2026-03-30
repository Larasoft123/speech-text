interface FooterLink {
  label: string;
  href: string;
}


const FOOTER_LINKS: FooterLink[] = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "API Documentation", href: "#" },
  { label: "Contact Support", href: "#" },
  { label: "Status", href: "#" },
];

export function LandingFooter() {
  return (
    <footer className="bg-surface-container-lowest w-full py-12 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-16">

        <div>
          <div className="text-lg font-black text-on-surface mb-2">OpenVoice</div>
          <p className="font-['Inter'] text-xs uppercase tracking-widest text-outline">
            {`© ${new Date().getFullYear()} OpenVoice AI. The Ethereal Tool for Global Discourse.`}
          </p>
        </div>


        <div className="flex flex-wrap md:justify-end gap-6">
          {FOOTER_LINKS.map((link, index) => (
            <a key={`footer-${link.href}-${index}`} href={link.href} className="font-['Inter'] text-xs uppercase tracking-widest text-outline hover:text-brand-primary transition-all opacity-80 hover:opacity-100">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
