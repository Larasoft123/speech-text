"use client";

import { Icon } from "@/shared/components/Icon";
import type {
  IconName,
  ProjectType,
  ProjectStatus,
  TeamMember,
  ProjectMetadata,
} from "@/shared/types";

interface ProjectCardProps {
  project: ProjectMetadata;
  onClick?: () => void;
  className?: string;
}

const typeIconMap: Record<ProjectType, IconName> = {
  audio: "audio_file",
  video: "video_file",
  text: "text_snippet",
};

const typeColorMap: Record<ProjectType, string> = {
  audio: "secondary",
  video: "tertiary",
  text: "primary",
};

export function ProjectCard({
  project,
  onClick,
  className = "",
}: ProjectCardProps) {
  const {
    icon = typeIconMap[project.type],
    iconColor = typeColorMap[project.type],
    title,
    status,
    statusLabel,
    progress,
    duration,
    languages,
    speakers,
    lastModified,
    teamMembers = [],
    isPinned,
  } = project;

  const hasProgress = status === "processing" && progress !== undefined;

  return (
    <article
      onClick={onClick}
      className={`
        bg-surface-container-high/40
        hover:bg-surface-container-high
        transition-all duration-300
        rounded-2xl p-6
        cursor-pointer
        border border-transparent
        hover:border-outline-variant/10
        group
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        {/* File Icon */}
        <div className="p-3 bg-surface-container rounded-xl">
          <Icon name={icon} size="lg" color={iconColor} />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Team Avatars */}
          {teamMembers.length > 0 && (
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 3).map((member, index) => (
                <div
                  key={index}
                  className="
                    w-6 h-6 rounded-full
                    border-2 border-surface-container
                    bg-surface-container
                    overflow-hidden
                  "
                >
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name || "Team member"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-variant">
                      <Icon name="account_circle" size="xs" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pinned Icon */}
          {isPinned && (
            <Icon name="push_pin" size="sm" color="slate-500" />
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-slate-100 group-hover:text-primary transition-colors mb-4">
        {title}
      </h4>

      {/* Progress Bar (if processing) */}
      {hasProgress && (
        <div className="mb-4">
          <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Badge (if processing) */}
      {status === "processing" && statusLabel && (
        <div className="mb-4">
          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            {statusLabel}
          </span>
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Duration */}
        {duration && (
          <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
            <Icon name="schedule" size="xs" />
            {duration}
          </span>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
            <Icon name="translate" size="xs" />
            {languages.join(", ")}
          </span>
        )}

        {/* Speakers */}
        {speakers !== undefined && (
          <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
            <Icon name="group" size="xs" />
            {speakers} Speakers
          </span>
        )}

        {/* Last Modified */}
        {lastModified && (
          <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
            <Icon name="calendar_today" size="xs" />
            {lastModified}
          </span>
        )}

        {/* Progress percentage */}
        {hasProgress && (
          <span className="text-[10px] text-slate-500">
            {progress}% Analyzing
          </span>
        )}
      </div>
    </article>
  );
}
