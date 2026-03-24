"use client";

import { CSSProperties } from "react";
import { IconName } from "../../shared/types";

type IconStyle = "outlined" | "filled";

interface IconProps {
  name: IconName;
  style?: IconStyle;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  color?: string;
  weight?: "100" | "200" | "300" | "400" | "500" | "600" | "700";
}

const sizeMap = {
  xs: "14px",
  sm: "18px",
  md: "24px",
  lg: "32px",
  xl: "40px",
  "2xl": "48px",
};

export function Icon({
  name,
  style = "outlined",
  size = "md",
  className = "",
  color,
  weight = "400",
}: IconProps) {
  const baseClass = style === "filled" 
    ? "material-symbols-filled" 
    : "material-symbols-outlined";

  const styleVars: CSSProperties = {
    fontSize: sizeMap[size],
    fontVariationSettings: `"FILL" ${style === "filled" ? 1 : 0}, "wght" ${weight}`,
    color: color || undefined,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <span className={baseClass} style={styleVars} data-icon={name}>
      {name}
    </span>
  );
}
