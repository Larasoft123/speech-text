import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface IconSelectProps<T extends string = string> {
  label: string;
  icon: string;
  items: SelectOption[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export function IconSelect<T extends string = string>({
  label,
  icon,
  items,
  value,
  onChange,
  disabled = false,
  className = '',
}: IconSelectProps<T>) {
  const isSingleOption = items.length <= 1;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-500 pointer-events-none">
          {icon}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          disabled={disabled || isSingleOption}
          className={`w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSingleOption ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {items.map((item) => (
            <option key={item.value} value={item.value} disabled={item.disabled}>
              {item.label}
            </option>
          ))}
        </select>
        {isSingleOption && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 uppercase tracking-wider pointer-events-none">
            Only
          </span>
        )}
      </div>
    </div>
  );
}