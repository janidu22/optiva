import { Orbit, CalendarCheck, BarChart3, Trophy } from "lucide-react";

const STEPS = [
  {
    step: 1,
    icon: Orbit,
    title: "Create your program",
    desc: "Define your starting point, set your target weight, and choose your checkpoint milestones — 3 months, 6 months, 1 year, and beyond.",
  },
  {
    step: 2,
    icon: CalendarCheck,
    title: "Plan your week",
    desc: "Build weekly meal plans with nutrition tracking and workout sessions with exercises, sets, and reps.",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Track daily",
    desc: "Weigh in, journal your day, log habits, track smoking and alcohol — build consistency one day at a time.",
  },
  {
    step: 4,
    icon: Trophy,
    title: "Hit checkpoints",
    desc: "Review trends and analytics. Celebrate wins at each milestone and adjust your plan as you evolve.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-muted/20 border-y">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Simple process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How it works
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Four steps to sustainable transformation. No guesswork, no
            complexity.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-border" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step circle */}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted/50 shadow-sm mb-5">
                  <s.icon className="h-6 w-6 text-foreground" />
                </div>

                {/* Step number badge */}
                <span
                  className="absolute -top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold"
                  style={{ right: "calc(50% - 32px)" }}
                >
                  {s.step}
                </span>

                <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
