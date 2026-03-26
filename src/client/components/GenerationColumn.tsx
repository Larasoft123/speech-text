"use client";

import { ErrorBoundary } from '@/client/components/ErrorBoundary';
import { AudioGeneratorPanel } from '@/client/components/AudioGeneratorPanel';

interface GenerationColumnProps {
  className?: string;
}

export function GenerationColumn({
  className = '',
}: GenerationColumnProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <ErrorBoundary>
        <AudioGeneratorPanel />
      </ErrorBoundary>
    </div>
  );
}