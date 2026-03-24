import { ReactNode } from "react";

type BadgeVariant = "primary" | "secondary" | "tertiary" | "status";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-tertiary/10 text-tertiary",
  status: "bg-surface-container text-on-surface-variant",
};

export function Badge({
  variant = "primary",
  children,
  className = "",
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1
        text-[10px] font-bold uppercase tracking-widest
        rounded-full
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full
            ${variant === "primary" ? "bg-primary" : ""}
            ${variant === "secondary" ? "bg-secondary" : ""}
            ${variant === "tertiary" ? "bg-tertiary" : ""}
            ${variant === "status" ? "bg-on-surface-variant" : ""}
          `}
        />
      )}
      {children}
    </span>
  );
}
