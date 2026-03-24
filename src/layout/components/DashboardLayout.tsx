"use client";

import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { SideNav } from "./SideNav";
import { Footer } from "./Footer";
import type { NavLink, NavItem, FooterLink, IconName } from "../../shared/types";

interface DashboardLayoutProps {
  children: ReactNode;
  // TopNav
  logo?: string;
  navLinks?: NavLink[];
  userAvatar?: string;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onLogoClick?: () => void;
  // SideNav
  sideNavTitle: string;
  sideNavSubtitle?: string;
  sideNavLogoIcon?: IconName;
  sideNavItems?: NavItem[];
  sideNavActiveHref?: string;
  sideNavFooterItems?: NavItem[];
  sideNavCtaLabel?: string;
  sideNavCtaIcon?: IconName;
  onSideNavCtaClick?: () => void;
  // Footer
  footerCopyright?: string;
  footerLinks?: FooterLink[];
}

export function DashboardLayout({
  children,
  // TopNav
  logo,
  navLinks = [],
  userAvatar,
  onNotificationsClick,
  onSettingsClick,
  onLogoClick,
  // SideNav
  sideNavTitle,
  sideNavSubtitle,
  sideNavLogoIcon,
  sideNavItems = [],
  sideNavActiveHref = "#",
  sideNavFooterItems = [],
  sideNavCtaLabel,
  sideNavCtaIcon,
  onSideNavCtaClick,
  // Footer
  footerCopyright,
  footerLinks = [],
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Top Navigation */}
      <TopNav
        logo={logo}
        navLinks={navLinks}
        userAvatar={userAvatar}
        onNotificationsClick={onNotificationsClick}
        onSettingsClick={onSettingsClick}
        onLogoClick={onLogoClick}
      />

      {/* Sidebar */}
      <SideNav
        title={sideNavTitle}
        subtitle={sideNavSubtitle}
        logoIcon={sideNavLogoIcon}
        navItems={sideNavItems}
        activeHref={sideNavActiveHref}
        footerItems={sideNavFooterItems}
        ctaLabel={sideNavCtaLabel}
        ctaIcon={sideNavCtaIcon}
        onCtaClick={onSideNavCtaClick}
      />

      {/* Main Content */}
      <main className="ml-64 pt-16 pb-10 min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <Footer
        copyright={footerCopyright}
        links={footerLinks}
      />
    </div>
  );
}
