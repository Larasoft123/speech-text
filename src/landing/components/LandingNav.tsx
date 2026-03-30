import Link from "next/link";
import { Button } from "@/shared/components/Button";


interface NavLink {
  label: string;
  href: string;
}



const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "Steps", href: "#steps" },
];

export function LandingNav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-xl shadow-ambient"
    >
      <nav className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto" aria-label="Main navigation">


        <Link href="/">
          <h2 className="text-xl font-bold tracking-tighter text-brand-primary">
            Openvoice
          </h2>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={`landing-nav-${link.href}-${index}`}
              href={link.href}
              className="text-on-surface-variant font-['Inter'] text-sm tracking-tight hover:text-on-surface transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button disabled variant="ghost">Login</Button>
          
        </div>
      </nav>
    </header>
  );
}
