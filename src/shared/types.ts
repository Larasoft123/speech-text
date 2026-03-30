// Shared types for components

export type IconName =
  // Navigation
  | "dashboard"
  | "description"
  | "translate"
  | "mic"
  | "inventory_2"
  | "temp_preferences_custom"
  // File types
  | "audio_file"
  | "video_file"
  | "text_snippet"
  | "folder"
  // UI
  | "cloud_upload"
  | "notifications"
  | "settings"
  | "push_pin"
  | "schedule"
  | "calendar_today"
  | "group"
  | "help"
  | "account_circle"
  | "search"
  | "menu"
  | "close"
  | "arrow_forward"
  | "arrow_back"
  // Status
  | "check_circle"
  | "error"
  | "warning"
  | "info"
  // Media
  | "play_arrow"
  | "pause"
  | "stop"
  | "skip_next"
  | "skip_previous"
  | "play_circle"
  | "volume_up"
  | "record_voice_over";

// Navigation Link (for TopNav - can have optional icon)
export interface NavLink {
  label: string;
  href: string;
  icon?: IconName;
  active?: boolean;
}

// Navigation Item (for SideNav - requires icon)
export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

// Footer Link
export interface FooterLink {
  label: string;
  href: string;
}

// Project Types
export type ProjectType = "audio" | "video" | "text";
export type ProjectStatus = "ready" | "processing" | "error";

export interface TeamMember {
  avatar?: string;
  name?: string;
}



export interface ProjectMetadata {
  icon?: IconName;
  iconColor?: string;
  title: string;
  type: ProjectType;
  status?: ProjectStatus;
  statusLabel?: string;
  progress?: number;
  duration?: string;
  languages?: string[];
  speakers?: number;
  lastModified?: string;
  teamMembers?: TeamMember[];
  isPinned?: boolean;
}
