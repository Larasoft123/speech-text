
export type EtherealTheme = "primary" | "secondary" | "tertiary" | "white";

export interface EtherealCardProps {
  number?: number;
  icon?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  theme?: EtherealTheme;
  className?: string;
}

const themeConfig: Record<EtherealTheme, {
  text: string;
  glow: string;
  border: string;
  accent: string;
  iconBg: string;
  haloGlow: string;
}> = {
  primary: {
    text: "text-primary",
    glow: "group-hover:shadow-[0_0_80px_-20px_rgba(255,178,183,0.15)]",
    border: "group-hover:border-primary/30",
    accent: "bg-primary",
    iconBg: "bg-primary/10",
    haloGlow: "bg-primary/5",
  },
  secondary: {
    text: "text-secondary",
    glow: "group-hover:shadow-[0_0_80px_-20px_rgba(130,211,222,0.15)]",
    border: "group-hover:border-secondary/30",
    accent: "bg-secondary",
    iconBg: "bg-secondary/10",
    haloGlow: "bg-secondary/5",
  },
  tertiary: {
    text: "text-tertiary",
    glow: "group-hover:shadow-[0_0_80px_-20px_rgba(251,188,0,0.15)]",
    border: "group-hover:border-tertiary/30",
    accent: "bg-tertiary",
    iconBg: "bg-tertiary/10",
    haloGlow: "bg-tertiary/5",
  },
  white: {
    text: "text-on-surface",
    glow: "group-hover:shadow-[0_0_80px_-20px_rgba(226,226,230,0.1)]",
    border: "group-hover:border-on-surface/20",
    accent: "bg-on-surface",
    iconBg: "bg-on-surface/5",
    haloGlow: "bg-on-surface/5",
  },
};

export function EtherealCard({
  number,
  icon,
  title,
  description,
  children,
  theme = "white",
  className = "",
}: EtherealCardProps) {
  const config = themeConfig[theme];

  return (
    <div className={`group relative h-full ${className}`}>
      {/* Background Halo Glow */}
      <div 
        className={`
          absolute inset-0 
          ${config.haloGlow} 
          blur-[100px] 
          rounded-full 
          opacity-0 
          group-hover:opacity-100 
          transition-opacity duration-700
          pointer-events-none
        `} 
        aria-hidden="true" 
      />

      {/* Card Body */}
      <div className={`
        relative
        h-full
        bg-surface-container-lowest/40 
        backdrop-blur-xl 
        rounded-[2.5rem] 
        p-10 
        flex flex-col
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        hover:bg-surface-container-high/80
        hover:-translate-y-4
        ${config.glow}
        ${config.border}
      `}>
        {/* Header: Icon and Number */}
        <div className="mb-8 relative flex justify-between items-start">
          {icon && (
            <div className={`
              w-16 h-16 
              rounded-2xl 
              bg-surface-container-highest 
              flex items-center justify-center 
              group-hover:scale-110 
              group-hover:-rotate-3
              transition-all duration-500
              shadow-glow-primary
              ${config.iconBg}
              ${config.text}
            `}>
              <span className="material-symbols-outlined text-3xl">
                {icon}
              </span>
            </div>
          )}

          {number !== undefined && (
            <span className="px-3 py-1 rounded-full bg-surface-container-highest/60 backdrop-blur-md text-[10px] font-black tracking-widest text-on-surface/40 group-hover:text-on-surface/80 transition-all duration-500">
              {number.toString().padStart(2, "0")}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h4 className={`text-xl font-black mb-4 text-on-surface transition-colors duration-500 ${config.text.replace('text-', 'group-hover:text-')}`}>
            {title}
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed opacity-60 group-hover:opacity-100 transition-all duration-500">
            {description}
          </p>
        </div>

        {/* Footer (Children) */}
        {children && (
          <div className="mt-8 pt-8 transition-all">
            {children}
          </div>
        )}

        {/* Indicator Line */}
        <div className={`
          mt-8 h-1 w-0 
          rounded-full 
          ${config.accent} 
          opacity-0 
          group-hover:w-16 
          group-hover:opacity-100 
          transition-all duration-700
        `} 
        aria-hidden="true"
        />
      </div>
    </div>
  );
}
