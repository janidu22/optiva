import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { SmokingAnalyticsResponse } from "@/types";
import { Cigarette, Flame } from "lucide-react";

interface Props {
  analytics: SmokingAnalyticsResponse | null;
}

const chartConfig: ChartConfig = {
  cigarettes: { label: "Cigarettes", color: "var(--chart-5)" },
};

export function SmokingWidget({ analytics }: Props) {
  const chartData = useMemo(() => {
    if (!analytics?.trendPoints) return [];
    return analytics.trendPoints.slice(-14).map((p) => ({
      date: format(parseISO(p.date), "MMM d"),
      cigarettes: p.cigarettesCount,
    }));
  }, [analytics]);

  return (
    <Card className="shadow-md overflow-hidden min-w-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Cigarette className="h-4 w-4" />
          Smoking
        </CardTitle>
        {analytics && analytics.smokeFreeStreak > 0 && (
          <Badge variant="default" className="gap-1 bg-emerald-600">
            <Flame className="h-3 w-3" />
            {analytics.smokeFreeStreak}d smoke-free
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!analytics ? (
          <p className="text-sm text-muted-foreground">No smoking data.</p>
        ) : (
          <>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Weekly avg: </span>
                <span className="font-semibold">
                  {(analytics.weeklyAvgCigarettes ?? 0).toFixed(1)} cigs
                </span>
              </div>
            </div>
            {chartData.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[120px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="date"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="cigarettes"
                    fill="var(--color-cigarettes)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
