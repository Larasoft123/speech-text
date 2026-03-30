"use client";

import { DashboardLayout } from "@/layout/components/DashboardLayout";
import { DropZone } from "@/dashboard/components/DropZone";
import { LiveSessionCard } from "@/dashboard/components/LiveSessionCard";
import { ProjectGrid } from "@/dashboard/components/ProjectGrid";
import type { NavItem, ProjectMetadata } from "@/shared/types";

// Datos fuera del componente (server-serialization optimization)
const NAV_LINKS = [
  { label: "Projects", href: "#", active: true },
  { label: "Library", href: "#" },
  { label: "Automation", href: "#" },
];

const SIDE_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "#", icon: "dashboard" },
  { label: "Transcriptions", href: "#", icon: "description" },
  { label: "Translations", href: "#", icon: "translate" },
  { label: "Voice Studio", href: "#", icon: "mic" },
  { label: "Archive", href: "#", icon: "inventory_2" },
];

const SIDE_NAV_FOOTER_ITEMS: NavItem[] = [
  { label: "Help Center", href: "#", icon: "help" },
  { label: "Account", href: "#", icon: "account_circle" },
];

const FOOTER_LINKS = [
  { label: "Status", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "API", href: "#" },
];

const SAMPLE_PROJECTS: ProjectMetadata[] = [
  {
    title: "Executive Board Meeting.mp3",
    type: "audio",
    duration: "42:10",
    languages: ["FR", "EN"],
    teamMembers: [
      { avatar: "https://i.pravatar.cc/150?img=1" },
      { avatar: "https://i.pravatar.cc/150?img=2" },
    ],
  },
  {
    title: "Podcast S02E04_Draft.mp4",
    type: "video",
    status: "processing",
    statusLabel: "Processing",
    progress: 67,
  },
  {
    title: "Interview Notes - AI Ethics",
    type: "text",
    lastModified: "2h ago",
    speakers: 3,
    isPinned: true,
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout
      logo="OpenVoice"
      navLinks={NAV_LINKS}
      userAvatar="https://i.pravatar.cc/150?img=10"
      sideNavTitle="Editorial Lab"
      sideNavSubtitle="Premium Tier"
      sideNavItems={SIDE_NAV_ITEMS}
      sideNavActiveHref="#"
      sideNavFooterItems={SIDE_NAV_FOOTER_ITEMS}
      footerLinks={FOOTER_LINKS}
    >
      <div className="max-w-6xl mx-auto px-12 py-12">
        {/* Hero Section */}
        <div className="relative mb-20">
          {/* Background Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]" />

          {/* Text */}
          <div className="text-center mb-12 relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-3">
              Welcome to the Lab
            </h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Upload your media or start a live recording to begin your editorial journey.
            </p>
          </div>

          {/* Upload Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
            <div className="lg:col-span-8">
              <DropZone
                title="Drop audio or video files"
                description="Supports MP3, WAV, MP4 up to 2GB"
              />
            </div>
            <div className="lg:col-span-4">
              <LiveSessionCard
                title="Capture Voice"
                description="Professional studio-grade transcription in real-time with speaker identification."
              />
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <ProjectGrid
          title="Recent Workspace"
          subtitle="Pick up where you left off"
          projects={SAMPLE_PROJECTS}
        />
      </div>
    </DashboardLayout>
  );
}
