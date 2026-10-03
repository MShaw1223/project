import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { OutcomeCounts } from "@/lib/tradeStats";
import { OUTCOME_CHART_CONFIG } from "@/components/dashboard/chartConfig";

export type AccountOutcomes = OutcomeCounts & { account: string };

const ROW_HEIGHT = 40;
const SEGMENTS = ["win", "breakeven", "loss"] as const;

export function OutcomesByAccountChart({ data }: { data: AccountOutcomes[] }) {
  return (
    <div className="space-y-4">
      <ChartContainer
        config={OUTCOME_CHART_CONFIG}
        className="aspect-auto w-full"
        style={{ height: Math.max(data.length * ROW_HEIGHT + 24, 96) }}
      >
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="account"
            tickLine={false}
            axisLine={false}
            width={96}
            tick={{ fontSize: 12 }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent labelKey="account" />} />
          {SEGMENTS.map((key) => (
            // the card-coloured stroke leaves a 2px gap between stacked segments
            <Bar
              key={key}
              dataKey={key}
              stackId="outcomes"
              fill={`var(--color-${key})`}
              stroke="hsl(var(--card))"
              strokeWidth={2}
              maxBarSize={24}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <ChartLegend config={OUTCOME_CHART_CONFIG} />
    </div>
  );
}
