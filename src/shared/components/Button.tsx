import { ButtonHTMLAttributes, forwardRef, Ref, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import type { IconName } from "../../shared/types";



type ButtonVariant = "primary" | "secondary" | "surface" | "tertiary" | "ghost" | "error";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
  external?: boolean;
  "aria-label"?: string;
}

export interface ButtonProps
  extends BaseButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-primary to-primary-container
    text-on-primary
    hover:opacity-90
  `,
  secondary: `
    bg-gradient-to-r from-secondary to-secondary-container
    text-on-secondary
    hover:opacity-90
  `,
  surface: `
    bg-surface-container-highest
    text-on-surface
    hover:bg-surface-bright
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
    text-xs font-bold uppercase tracking-widest
  `,
  error: `
    bg-gradient-to-r from-error to-error-container
    text-on-error
    hover:opacity-90
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs rounded-lg gap-2 min-h-[40px]",
  md: "px-6 py-3 text-sm rounded-xl gap-2 min-h-[48px]",
  lg: "px-8 py-4 text-base rounded-2xl gap-3 min-h-[56px]",
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      loading = false,
      fullWidth = false,
      href,
      external = false,
      children,
      className = "",
      disabled,
      "aria-label": ariaLabel,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Accessibility check: Ensure aria-label is present if no children
    const finalAriaLabel = !children ? ariaLabel : undefined;

    const commonClasses = `
      inline-flex items-center justify-center
      font-bold
      transition-all duration-300
      cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${fullWidth ? "w-full" : ""}
      ${className}
    `;

    const content = (
      <>
        {loading && iconPosition === "left" && (
          <Icon
            name="schedule"
            size={size === "sm" ? "sm" : "md"}
            className="animate-spin"
            aria-hidden="true"
          />
        )}
        {!loading && icon && iconPosition === "left" && (
          <Icon name={icon} size={size === "sm" ? "sm" : "md"} aria-hidden="true" />
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <Icon name={icon} size={size === "sm" ? "sm" : "md"} aria-hidden="true" />
        )}
        {loading && iconPosition === "right" && (
          <Icon
            name="schedule"
            size={size === "sm" ? "sm" : "md"}
            className="animate-spin"
            aria-hidden="true"
          />
        )}
      </>
    );

    // Render as Link if href is present
    if (href) {
      const isExternal = external || href.startsWith("http");
      const linkProps = isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {};

      return (
        <Link
          href={href}
          className={commonClasses}
          aria-label={finalAriaLabel}
          aria-busy={loading}
          {...linkProps}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type={type as "button" | "submit" | "reset"}
        disabled={isDisabled}
        className={commonClasses}
        aria-label={finalAriaLabel}
        aria-busy={loading}
        aria-live={loading ? "polite" : undefined}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
