"use client";

import { Icon } from "@/shared/components/Icon";
import type { NavItem, IconName } from "../../shared/types";

interface SideNavProps {
  logoIcon?: IconName;
  logoIconColor?: string;
  title: string;
  subtitle?: string;
  navItems?: NavItem[];
  activeHref?: string;
  footerItems?: NavItem[];
  ctaLabel?: string;
  ctaIcon?: IconName;
  onCtaClick?: () => void;
}

const DEFAULT_LOGO_ICON: IconName = "temp_preferences_custom";

export function SideNav({
  logoIcon = DEFAULT_LOGO_ICON,
  logoIconColor = "primary",
  title,
  subtitle,
  navItems = [],
  activeHref = "#",
  footerItems = [],
  ctaLabel = "New Recording",
  ctaIcon = "mic",
  onCtaClick,
}: SideNavProps) {
  return (
    <aside
      className="
        fixed left-0 top-16
        h-[calc(100vh-64px)] w-64
        bg-surface-container-lowest
        flex flex-col
        border-r border-outline-variant/20
        z-40
      "
    >
      {/* Main Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Logo/Tier Section */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="
              w-10 h-10 rounded-lg
              bg-surface-container
              flex items-center justify-center
              border border-outline-variant/10
            "
          >
            <Icon name={logoIcon} size="md" color={`var(--${logoIconColor})`} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 leading-none">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item, index) => {
            const isActive = item.href === activeHref;
            return (
              <a
                key={`nav-${item.href}-${index}`}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5
                  text-sm font-medium
                  rounded-lg
                  transition-all duration-300
                  ${
                    isActive
                      ? "bg-surface-container text-slate-100"
                      : "text-slate-500 hover:text-slate-300 hover:bg-surface-container/50 hover:translate-x-1"
                  }
                `}
              >
                <Icon
                  name={item.icon}
                  size="md"
                  color={isActive ? "primary" : undefined}
                />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* CTA Button */}
      <div className="px-6 mt-auto">
        <button
          onClick={onCtaClick}
          className="
            w-full py-3
            bg-gradient-to-r from-primary to-primary-container
            text-on-primary font-bold
            rounded-xl text-sm
            shadow-lg shadow-primary/10
            active:scale-[0.98] transition-all
            hover:opacity-90
          "
        >
          <span className="flex items-center justify-center gap-2">
            <Icon name={ctaIcon} size="md" weight="500" />
            {ctaLabel}
          </span>
        </button>
      </div>

      {/* Footer Links */}
      {footerItems.length > 0 && (
        <div className="px-6 py-8 border-t border-outline-variant/10">
          <nav className="space-y-1">
            {footerItems.map((item, index) => (
              <a
                key={`footer-nav-${item.href}-${index}`}
                href={item.href}
                className="
                  flex items-center gap-3 px-4 py-2
                  text-slate-600 hover:text-brand-primary
                  text-sm font-medium
                  transition-colors
                "
              >
                <Icon name={item.icon} size="md" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </aside>
  );
}
