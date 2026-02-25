import { useQueries } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { HabitResponse } from "@/types";
import { habitApi } from "@/api/endpoints";

interface Props {
  habits: HabitResponse[];
}

export function HabitAdherence({ habits }: Props) {
  const activeHabits = habits.filter((h) => h.isActive);

  const analyticsQueries = useQueries({
    queries: activeHabits.map((h) => ({
      queryKey: ["habit-analytics", h.id],
      queryFn: () => habitApi.getAnalytics(h.id),
      enabled: activeHabits.length > 0,
    })),
  });

  const isLoading = analyticsQueries.some((q) => q.isLoading);
  const analytics = analyticsQueries.filter((q) => q.data).map((q) => q.data!);

  const avg7 = analytics.length
    ? Math.round(
        analytics.reduce((s, a) => s + a.adherence7Day, 0) / analytics.length,
      )
    : 0;
  const avg30 = analytics.length
    ? Math.round(
        analytics.reduce((s, a) => s + a.adherence30Day, 0) / analytics.length,
      )
    : 0;

  return (
    <Card className="shadow-md overflow-hidden min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Habit Adherence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : activeHabits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active habits.</p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">7-day</span>
                <span className="font-semibold">{avg7}%</span>
              </div>
              <Progress value={avg7} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">30-day</span>
                <span className="font-semibold">{avg30}%</span>
              </div>
              <Progress value={avg30} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground">
              Tracking {activeHabits.length} active habit
              {activeHabits.length !== 1 ? "s" : ""}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
