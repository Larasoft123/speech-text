import React from 'react';

interface ColumnSkeletonProps {
  lines?: number;
  className?: string;
}

export function ColumnSkeleton({ lines = 3, className = '' }: ColumnSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-surface-container rounded animate-pulse" />
        <div className="h-4 w-20 bg-surface-container rounded animate-pulse" />
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <div
            key={i}
            className="h-4 bg-surface-container rounded animate-pulse"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
      
      {/* Button skeleton */}
      <div className="flex justify-center gap-3 mt-6">
        <div className="h-12 w-24 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-12 w-24 bg-surface-container rounded-xl animate-pulse" />
        <div className="h-12 w-12 bg-surface-container rounded-xl animate-pulse" />
      </div>
    </div>
  );
}