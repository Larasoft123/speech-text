"use client";

import { Icon } from "@/shared/components/Icon";
import { Button } from "@/shared/components/Button";

interface DropZoneProps {
  title?: string;
  description?: string;
  supportedFormats?: string;
  maxSize?: string;
  onBrowseClick?: () => void;
  onDrop?: (files: FileList) => void;
  className?: string;
}

// Estilos fuera del componente
const CONTAINER_CLASS = "group relative overflow-hidden bg-surface-container-low backdrop-blur-sm rounded-[2rem] hover:bg-surface-container-lowest transition-all duration-500 cursor-pointer flex flex-col items-center justify-center p-16 shadow-glow-primary";

const ICON_CLASS = "w-20 h-20 rounded-3xl bg-surface-container-high flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500";

export function DropZone({
  title = "Drop audio or video files",
  description = "Supports MP3, WAV, MP4 up to 2GB",
  supportedFormats = "MP3, WAV, MP4",
  maxSize = "2GB",
  onBrowseClick,
  onDrop,
  className = "",
}: DropZoneProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDrop && e.dataTransfer.files) {
      onDrop(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`${CONTAINER_CLASS} ${className}`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Icon */}
      <div className={ICON_CLASS}>
        <Icon name="cloud_upload" size="2xl" color="primary" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-on-surface mb-2 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-on-surface-variant text-sm mb-8 text-center">
        {description}
      </p>

      {/* Supported Formats Badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] text-outline uppercase tracking-wider">
          {supportedFormats}
        </span>
        <span className="text-outline-variant">•</span>
        <span className="text-[10px] text-outline uppercase tracking-wider">
          Max {maxSize}
        </span>
      </div>

      {/* Browse Button */}
      <Button
        variant="secondary"
        size="md"
        onClick={onBrowseClick}
      >
        Browse Files
      </Button>
    </div>
  );
}
