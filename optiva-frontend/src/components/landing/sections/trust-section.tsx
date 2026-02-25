import { Target, CalendarCheck, BookOpen, TrendingUp } from "lucide-react";

const VALUES = [
  {
    icon: Target,
    title: "Milestone Checkpoints",
    desc: "3 months → 6 months → 1 year → beyond",
  },
  {
    icon: CalendarCheck,
    title: "Weekly Planning",
    desc: "Meal plans & workout sessions, every week",
  },
  {
    icon: BookOpen,
    title: "Daily Journaling",
    desc: "Track mood, energy, sleep & self-awareness",
  },
  {
    icon: TrendingUp,
    title: "Streaks & Scores",
    desc: "Consistency scoring that keeps you accountable",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20 border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
                <v.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-tight">{v.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
