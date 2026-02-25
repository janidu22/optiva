import { useMemo } from "react";
import { subDays, parseISO, isAfter } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  WeightEntryResponse,
  JournalEntryResponse,
  HabitResponse,
} from "@/types";
import { Activity } from "lucide-react";

interface Props {
  weightEntries: WeightEntryResponse[];
  journalEntries: JournalEntryResponse[];
  habits: HabitResponse[];
}

export function ConsistencyScore({
  weightEntries,
  journalEntries,
  habits,
}: Props) {
  const score = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Weight: how many days in last 30 have entries?
    const recentWeight = weightEntries.filter((w) =>
      isAfter(parseISO(w.date), thirtyDaysAgo),
    ).length;
    const weightScore = Math.min(recentWeight / 7, 1); // 7+ entries in 30 days = 100%

    // Journal: how many days in last 30 have entries?
    const recentJournal = journalEntries.filter((j) =>
      isAfter(parseISO(j.date), thirtyDaysAgo),
    ).length;
    const journalScore = Math.min(recentJournal / 15, 1); // 15+ entries = 100%

    // Habits: are there any active habits?
    const activeHabits = habits.filter((h) => h.isActive).length;
    const habitScore = activeHabits > 0 ? 1 : 0;

    const overall = Math.round(
      ((weightScore + journalScore + habitScore) / 3) * 100,
    );
    return overall;
  }, [weightEntries, journalEntries, habits]);

  const color =
    score >= 70
      ? "text-emerald-500"
      : score >= 40
        ? "text-amber-500"
        : "text-rose-500";

  const ringColor =
    score >= 70
      ? "stroke-emerald-500"
      : score >= 40
        ? "stroke-amber-500"
        : "stroke-rose-500";

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="shadow-md overflow-hidden min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Consistency
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-2">
        <div className="relative">
          <svg width="100" height="100" className="-rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="8"
              className="stroke-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={ringColor}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${color}`}>{score}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
      </CardContent>
    </Card>
  );
}
