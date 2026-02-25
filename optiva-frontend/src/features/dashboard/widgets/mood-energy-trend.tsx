import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { JournalEntryResponse } from "@/types";

interface Props {
  entries: JournalEntryResponse[];
}

const chartConfig: ChartConfig = {
  mood: { label: "Mood", color: "var(--chart-1)" },
  energy: { label: "Energy", color: "var(--chart-3)" },
};

export function MoodEnergyTrend({ entries }: Props) {
  const chartData = useMemo(() => {
    const sorted = [...entries]
      .filter((e) => e.mood || e.energy)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
    return sorted.map((e) => ({
      date: format(parseISO(e.date), "MMM d"),
      mood: e.mood || 0,
      energy: e.energy || 0,
    }));
  }, [entries]);

  return (
    <Card className="shadow-md overflow-hidden min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Mood & Energy Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No journal entries with mood/energy data.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 10]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="var(--color-mood)"
                fill="var(--color-mood)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="energy"
                stroke="var(--color-energy)"
                fill="var(--color-energy)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
