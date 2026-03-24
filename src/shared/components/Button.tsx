"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Icon } from "./Icon";
import type { IconName } from "../../shared/types";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-primary to-primary-container
    text-on-primary
    shadow-lg shadow-primary/10
    hover:opacity-90
    active:scale-[0.98]
  `,
  secondary: `
    bg-surface-container-highest
    text-on-surface
    border border-outline-variant/10
    hover:bg-surface-bright
    active:scale-[0.98]
  `,
  tertiary: `
    bg-transparent
    text-primary
    hover:opacity-80
  `,
  ghost: `
    bg-transparent
    text-on-surface-variant
    hover:bg-surface-container-high
    active:scale-[0.98]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs rounded-lg gap-2",
  md: "px-6 py-3 text-sm rounded-xl gap-2",
  lg: "px-8 py-4 text-base rounded-2xl gap-3",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      loading = false,
      fullWidth = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center
          font-bold
          transition-all duration-300
          cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading && iconPosition === "left" && (
          <Icon name="schedule" size="sm" className="animate-spin" />
        )}
        {!loading && icon && iconPosition === "left" && (
          <Icon name={icon} size="sm" />
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <Icon name={icon} size="sm" />
        )}
        {loading && iconPosition === "right" && (
          <Icon name="schedule" size="sm" className="animate-spin" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
