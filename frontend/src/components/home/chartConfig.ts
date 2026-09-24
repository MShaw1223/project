import { ChartConfig } from "@/components/ui/chart";

// outcomes read as a diverging scale: win and loss poles either side of a neutral breakeven
export const OUTCOME_CHART_CONFIG = {
  win: { label: "Win", color: "var(--chart-win)" },
  breakeven: { label: "Breakeven", color: "var(--chart-breakeven)" },
  loss: { label: "Loss", color: "var(--chart-loss)" },
} satisfies ChartConfig;

export const formatShortDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
