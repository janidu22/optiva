import { useQuery } from "@tanstack/react-query";
import {
  weightApi,
  habitApi,
  smokingApi,
  alcoholApi,
  journalApi,
  programApi,
} from "@/api/endpoints";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { WeightTrendChart } from "./widgets/weight-trend-chart";
import { CheckpointProgress } from "./widgets/checkpoint-progress";
import { HabitAdherence } from "./widgets/habit-adherence";
import { MoodEnergyTrend } from "./widgets/mood-energy-trend";
import { SmokingWidget } from "./widgets/smoking-widget";
import { AlcoholWidget } from "./widgets/alcohol-widget";
import { ConsistencyScore } from "./widgets/consistency-score";

export default function DashboardPage() {
  const weightQuery = useQuery({
    queryKey: ["weight"],
    queryFn: weightApi.getAll,
  });
  const weightStatsQuery = useQuery({
    queryKey: ["weight-stats"],
    queryFn: weightApi.getStats,
  });
  const habitsQuery = useQuery({
    queryKey: ["habits"],
    queryFn: habitApi.getAll,
  });
  const smokingQuery = useQuery({
    queryKey: ["smoking-analytics"],
    queryFn: smokingApi.getAnalytics,
  });
  const alcoholQuery = useQuery({
    queryKey: ["alcohol-analytics"],
    queryFn: alcoholApi.getAnalytics,
  });
  const journalQuery = useQuery({
    queryKey: ["journal"],
    queryFn: journalApi.getAll,
  });
  const programsQuery = useQuery({
    queryKey: ["programs"],
    queryFn: programApi.getAll,
  });

  const isLoading =
    weightQuery.isLoading ||
    weightStatsQuery.isLoading ||
    habitsQuery.isLoading ||
    smokingQuery.isLoading ||
    alcoholQuery.isLoading ||
    journalQuery.isLoading ||
    programsQuery.isLoading;

  const hasError =
    weightQuery.isError && habitsQuery.isError && smokingQuery.isError;

  if (isLoading) return <PageSkeleton cards={7} />;

  if (hasError) {
    return (
      <ErrorState
        message="Could not load dashboard data."
        onRetry={() => {
          weightQuery.refetch();
          habitsQuery.refetch();
          smokingQuery.refetch();
          alcoholQuery.refetch();
          journalQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your transformation at a glance.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <ConsistencyScore
          weightEntries={weightQuery.data ?? []}
          journalEntries={journalQuery.data ?? []}
          habits={habitsQuery.data ?? []}
        />
        <CheckpointProgress programs={programsQuery.data ?? []} />
        <HabitAdherence habits={habitsQuery.data ?? []} />
        <SmokingWidget analytics={smokingQuery.data ?? null} />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <WeightTrendChart
          entries={weightQuery.data ?? []}
          stats={weightStatsQuery.data ?? null}
        />
        <MoodEnergyTrend entries={journalQuery.data ?? []} />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <AlcoholWidget analytics={alcoholQuery.data ?? null} />
      </div>
    </div>
  );
}
