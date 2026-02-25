import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import type { WeightEntryResponse, WeightStatsResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  entries: WeightEntryResponse[];
  stats: WeightStatsResponse | null;
}

const chartConfig: ChartConfig = {
  weight: { label: "Weight (kg)", color: "var(--chart-1)" },
  average: { label: "7-Day Avg", color: "var(--chart-2)" },
};

export function WeightTrendChart({ entries, stats }: Props) {
  const chartData = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return sorted.map((e, i) => {
      const window = sorted.slice(Math.max(0, i - 6), i + 1);
      const avg = window.reduce((s, w) => s + w.weightKg, 0) / window.length;
      return {
        date: format(parseISO(e.date), "MMM d"),
        weight: e.weightKg,
        average: Math.round(avg * 10) / 10,
      };
    });
  }, [entries]);

  const change = stats?.totalChange ?? 0;

  return (
    <Card className="shadow-md overflow-hidden min-w-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Weight Trend</CardTitle>
        {stats && (
          <Badge
            variant={change <= 0 ? "default" : "destructive"}
            className="gap-1"
          >
            {change <= 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            {Math.abs(change).toFixed(1)} kg
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No weight entries yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={chartData}>
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
                domain={["dataMin - 1", "dataMax + 1"]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--color-weight)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="var(--color-average)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
