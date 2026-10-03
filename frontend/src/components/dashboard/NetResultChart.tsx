import type { ComponentProps } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { NetResultPoint } from "@/lib/tradeStats";
import { formatShortDate } from "@/components/dashboard/chartConfig";

const config = {
  net: { label: "Net wins", color: "var(--chart-primary)" },
} satisfies ChartConfig;

const signed = (value: number | string) => (Number(value) > 0 ? `+${value}` : String(value));

export function NetResultChart({ data }: { data: NetResultPoint[] }) {
  return (
    <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="net-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-net)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--color-net)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={formatShortDate}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={signed} width={48} />
        <ReferenceLine y={0} />
        <ChartTooltip
          cursor={{ strokeWidth: 1 }}
          content={<NetTooltip />}
        />
        <Area
          dataKey="net"
          type="linear"
          stroke="var(--color-net)"
          strokeWidth={2}
          fill="url(#net-fill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
        />
      </AreaChart>
    </ChartContainer>
  );
}

type NetTooltipProps = ComponentProps<typeof ChartTooltipContent>;

// recharts clones this element with the hover state, the date is formatted before it reaches the shared tooltip
const NetTooltip = ({ label, ...props }: NetTooltipProps) => (
  <ChartTooltipContent
    {...props}
    label={typeof label === "string" ? formatShortDate(label) : label}
    valueFormatter={signed}
  />
);
