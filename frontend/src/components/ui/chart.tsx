import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// maps a series key to its label and colour, colours are exposed to the chart as --color-<key>
export type ChartConfig = Record<string, { label: React.ReactNode; color: string }>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  }
>(({ config, className, children, style, ...props }, ref) => {
  const colorVars = Object.fromEntries(
    Object.entries(config).map(([key, { color }]) => [`--color-${key}`, color])
  ) as React.CSSProperties;
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        style={{ ...colorVars, ...style }}
        className={cn(
          "flex aspect-video justify-center text-xs",
          // recessive chrome: hairline grid, muted axis ink, no focus outline on the svg
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-cartesian-axis-line]:stroke-border [&_.recharts-reference-line_line]:stroke-border",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-surface]:outline-hidden [&_.recharts-sector]:outline-hidden",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string | Array<number | string>;
  color?: string;
  payload?: Record<string, unknown>;
};

const ChartTooltipContent = ({
  active,
  payload,
  label,
  labelKey,
  valueFormatter = (value) => String(value),
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: React.ReactNode;
  // read the tooltip title from this field of the hovered datum instead of the axis label
  labelKey?: string;
  valueFormatter?: (value: number | string, key: string) => React.ReactNode;
}) => {
  const { config } = useChart();
  if (!active || !payload?.length) return null;
  const title = labelKey ? payload[0].payload?.[labelKey] : label;
  return (
    <div className="grid min-w-32 gap-1.5 rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
      {title !== undefined && title !== null && <div className="font-medium">{String(title)}</div>}
      <div className="grid gap-1">
        {payload.map((item) => {
          const key = String(item.dataKey ?? item.name ?? "value");
          const entry = config[key];
          const value = Array.isArray(item.value) ? item.value.join(" – ") : item.value;
          return (
            <div key={key} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: entry?.color ?? item.color }}
              />
              <span className="flex-1 text-muted-foreground">{entry?.label ?? item.name}</span>
              <span className="font-mono font-medium tabular-nums">
                {value !== undefined ? valueFormatter(value, key) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// a static legend driven by the chart config, so identity never relies on colour alone
const ChartLegend = ({
  config,
  className,
  keys,
}: {
  config: ChartConfig;
  className?: string;
  keys?: string[];
}) => {
  return (
    <ul className={cn("flex flex-wrap items-center justify-center gap-4 text-xs", className)}>
      {(keys ?? Object.keys(config)).map((key) => (
        <li key={key} className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: config[key].color }} />
          {config[key].label}
        </li>
      ))}
    </ul>
  );
};

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend };
