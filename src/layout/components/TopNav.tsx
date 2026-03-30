"use client";


import { Icon } from "@/shared/components/Icon";
import type { NavLink } from "@/shared/types";

interface TopNavProps {
  logo?: string;
  navLinks?: NavLink[];
  userAvatar?: string;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onLogoClick?: () => void;
}

export function TopNav({
  logo = "OpenVoice",
  navLinks = [],
  userAvatar,
  onNotificationsClick,
  onSettingsClick,
  onLogoClick,
}: TopNavProps) {
  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        h-16
        bg-surface/80
        backdrop-blur-xl
        flex justify-between items-center
        px-8
        shadow-ambient
      "
    >
      {/* Logo & Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <button
          onClick={onLogoClick}
          className="text-xl font-bold tracking-tighter text-on-surface hover:text-primary transition-colors"
        >
          {logo}
        </button>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link, index) => (
            <a
              key={`topnav-${link.href}-${index}`}
              href={link.href}
              className={`
                transition-colors pb-1
                ${
                  link.active
                    ? "text-brand-primary border-b-2 border-brand-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }
              `}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={onNotificationsClick}
          className="
            p-2 text-on-surface-variant
            hover:bg-surface-container-high hover:text-on-surface
            rounded-full transition-all duration-300 active:scale-95
          "
          aria-label="Notifications"
        >
          <Icon name="notifications" />
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsClick}
          className="
            p-2 text-on-surface-variant
            hover:bg-surface-container-high hover:text-on-surface
            rounded-full transition-all duration-300 active:scale-95
          "
          aria-label="Settings"
        >
          <Icon name="settings" />
        </button>

        {/* User Avatar */}
        {userAvatar && (
          <div
            className="
              w-8 h-8 rounded-full
              bg-surface-container-high overflow-hidden
              cursor-pointer hover:ring-2 hover:ring-primary/50
              transition-all
            "
          >
            <img
              src={userAvatar}
              alt="User profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
}
