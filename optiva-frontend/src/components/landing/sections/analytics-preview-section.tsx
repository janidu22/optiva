import { TrendingUp, Flame, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AnalyticsPreviewSection() {
  return (
    <section id="analytics" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Insights that matter
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            See your progress clearly
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Clean dashboards and trend analytics to keep you motivated and
            informed.
          </p>
        </div>

        {/* Preview Grid — 3 widgets only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Weight Trend */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold">Weight Trend</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                90 days
              </Badge>
            </div>
            <div className="flex items-end gap-1 h-20">
              {[70, 68, 65, 63, 60, 58, 55, 54, 52, 50, 48, 45].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-foreground/20"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Starting: 85 kg</span>
              <span className="font-medium text-foreground">
                Current: 78.2 kg
              </span>
            </div>
          </div>

          {/* Consistency Score */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-foreground" />
                <span className="text-sm font-semibold">Consistency</span>
              </div>
              <Badge variant="outline" className="text-[10px]">
                This month
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${0.82 * 201} 201`}
                    strokeLinecap="round"
                    className="text-foreground"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  82%
                </span>
              </div>
              <div className="space-y-2 flex-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Meals logged</span>
                    <span className="font-medium">90%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: "90%" }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Workouts</span>
                    <span className="font-medium">75%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: "75%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Streaks */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-foreground" />
              <span className="text-sm font-semibold">Active Streaks</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "No junk food", days: 18, pct: 60 },
                { label: "Smoke-free", days: 23, pct: 77 },
                { label: "Alcohol-free", days: 31, pct: 100 },
              ].map((s) => (
                <div key={s.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.days} days</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
