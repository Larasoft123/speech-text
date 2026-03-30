import React from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", ...props }, ref) => {
    return (
      <label
        className={`flex items-start gap-3 p-4 bg-surface-container-lowest rounded-xl cursor-pointer hover:bg-surface-container transition-all group ${
          props.disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <div className="relative flex items-center shrink-0 mt-0.5">
          <input
            {...props}
            type="checkbox"
            ref={ref}
            className="peer appearance-none w-5 h-5 border-2 border-outline-variant/40 rounded bg-surface-container-lowest checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors disabled:cursor-not-allowed"
          />
          <span className="material-symbols-outlined text-on-primary text-[16px] font-bold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">
            check
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-on-surface group-hover:text-on-surface transition-colors">
            {label}
          </span>
          {description && (
            <span className="text-xs text-on-surface-variant mt-1">
              {description}
            </span>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
