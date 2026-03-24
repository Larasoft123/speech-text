"use client";

import { ProjectCard } from "./ProjectCard";
import type { ProjectMetadata } from "@/shared/types";
import { Button } from "@/shared/components/Button";

interface ProjectGridProps {
  title?: string;
  subtitle?: string;
  projects: ProjectMetadata[];
  viewAllLabel?: string;
  onProjectClick?: (project: ProjectMetadata) => void;
  onViewAllClick?: () => void;
  className?: string;
}

export function ProjectGrid({
  title = "Recent Workspace",
  subtitle = "Pick up where you left off",
  projects = [],
  viewAllLabel = "View All Library",
  onProjectClick,
  onViewAllClick,
  className = "",
}: ProjectGridProps) {
  return (
    <section className={className}>
      {/* Section Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {onViewAllClick && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={onViewAllClick}
          >
            {viewAllLabel}
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.title + index}
            project={project}
            onClick={() => onProjectClick?.(project)}
          />
        ))}
      </div>
    </section>
  );
}
