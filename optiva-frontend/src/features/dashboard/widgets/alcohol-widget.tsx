import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { AlcoholAnalyticsResponse } from "@/types";
import { Wine, Droplets } from "lucide-react";

interface Props {
  analytics: AlcoholAnalyticsResponse | null;
}

const chartConfig: ChartConfig = {
  totalUnits: { label: "Units", color: "var(--chart-4)" },
};

export function AlcoholWidget({ analytics }: Props) {
  const chartData = useMemo(() => {
    if (!analytics?.monthlyTrend) return [];
    return analytics.monthlyTrend.map((m) => ({
      month: m.month,
      totalUnits: m.totalUnits,
    }));
  }, [analytics]);

  return (
    <Card className="shadow-md overflow-hidden min-w-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Wine className="h-4 w-4" />
          Alcohol
        </CardTitle>
        {analytics && analytics.alcoholFreeStreak > 0 && (
          <Badge variant="default" className="gap-1 bg-emerald-600">
            <Droplets className="h-3 w-3" />
            {analytics.alcoholFreeStreak}d alcohol-free
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!analytics ? (
          <p className="text-sm text-muted-foreground">No alcohol data.</p>
        ) : (
          <>
            <div className="text-sm">
              <span className="text-muted-foreground">This week: </span>
              <span className="font-semibold">
                {analytics.unitsThisWeek} units
              </span>
            </div>
            {chartData.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[160px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="totalUnits"
                    fill="var(--color-totalUnits)"
                    radius={[4, 4, 0, 0]}
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
