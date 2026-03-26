import React from 'react';

export type StatusState = 'idle' | 'loading' | 'ready' | 'processing' | 'error';

interface StatusIndicatorProps {
  state: StatusState;
  model?: string;
  device?: 'webgpu' | 'wasm';
  progress?: number;
  className?: string;
}

export function StatusIndicator({
  state,
  model,
  device,
  progress,
  className = '',
}: StatusIndicatorProps) {
  const getStateColor = () => {
    switch (state) {
      case 'idle': return 'bg-surface-container';
      case 'loading': return 'bg-secondary/20 animate-pulse';
      case 'ready': return 'bg-secondary';
      case 'processing': return 'bg-primary';
      case 'error': return 'bg-error';
      default: return 'bg-surface-container';
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'idle': return 'Idle';
      case 'loading': return 'Loading model...';
      case 'ready': return 'Ready';
      case 'processing': return 'Processing...';
      case 'error': return 'Error';
      default: return '';
    }
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStateColor()}`} />
      <span className="text-slate-400">{getStateText()}</span>
      {model && state !== 'idle' && (
        <span className="text-slate-500">• {model}</span>
      )}
      {device && state === 'ready' && (
        <span className="text-slate-500 uppercase">• {device}</span>
      )}
      {progress !== undefined && state === 'loading' && (
        <span className="text-slate-500">{Math.round(progress)}%</span>
      )}
    </div>
  );
}