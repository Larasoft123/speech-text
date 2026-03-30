import { EtherealCard, type EtherealTheme } from "./EtherealCard";

interface GridItem {
  title: string;
  description: string;
  icon?: string;
  number?: number;
  footer?: React.ReactNode;
}

interface EtherealGridProps {
  items: GridItem[];
  inverted?: boolean;
  showNumbers?: boolean;
  columns?: number;
  className?: string;
}

export function EtherealGrid({
  items,
  inverted = false,
  showNumbers = false,
  columns = 4,
  className = "",
}: EtherealGridProps) {
  const themes: EtherealTheme[] = ["primary", "secondary", "tertiary"];

  // Mapping grid-cols dynamically in Tailwind 4
  const gridColsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-6",
  };

  const gridClass = gridColsMap[columns] || "grid-cols-1 md:grid-cols-4";

  return (
    <div className={`grid ${gridClass} gap-8 ${className}`}>
      {items.map((item, index) => {
        // Theme logic
        let themeIndex;
        if (inverted) {
          // If inverted, start from tertiary or reverse the sequence based on total items
          themeIndex = (items.length - 1 - index) % themes.length;
        } else {
          themeIndex = index % themes.length;
        }

        const theme = themes[themeIndex] || "white";

        return (
          <EtherealCard
            key={`ethereal-card-${index}`}
            title={item.title}
            description={item.description}
            icon={item.icon}
            number={showNumbers ? (item.number ?? index + 1) : undefined}
            theme={theme}
          >
            {item.footer}
          </EtherealCard>
        );
      })}
    </div>
  );
}
