import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PairWinRate } from "@/lib/tradeStats";

const config = {
  winRate: { label: "Win rate", color: "var(--chart-primary)" },
} satisfies ChartConfig;

const ROW_HEIGHT = 32;

export function PairWinRateChart({ data }: { data: PairWinRate[] }) {
  return (
    <ChartContainer
      config={config}
      className="aspect-auto w-full"
      style={{ height: Math.max(data.length * ROW_HEIGHT + 24, 120) }}
    >
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="pair"
          tickLine={false}
          axisLine={false}
          width={64}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelKey="pair" valueFormatter={(value) => `${value}%`} />}
        />
        <Bar dataKey="winRate" fill="var(--color-winRate)" radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="winRate"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
            formatter={(value) => `${value}%`}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
