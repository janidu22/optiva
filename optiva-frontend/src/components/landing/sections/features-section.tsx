import {
  Target,
  Scale,
  UtensilsCrossed,
  Dumbbell,
  BookOpen,
  HeartPulse,
} from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Milestone Checkpoints",
    desc: "Set goals at 3 months, 6 months, 1 year, and beyond. Track progress against your personal roadmap.",
  },
  {
    icon: Scale,
    title: "Weight Tracking & Trends",
    desc: "Daily weigh-ins with rolling averages, trend analysis, and visual progress over time.",
  },
  {
    icon: UtensilsCrossed,
    title: "Meal Planner",
    desc: "Plan breakfast, lunch, dinner, and snacks weekly. Track calories, protein, carbs, and fat per item.",
  },
  {
    icon: Dumbbell,
    title: "Workout Planner",
    desc: "Structure weekly sessions with exercises, sets, reps, weight, and duration.",
  },
  {
    icon: BookOpen,
    title: "Daily Journal",
    desc: "Log what you ate, how you felt. Track mood, energy, sleep quality, and stress — all in one place.",
  },
  {
    icon: HeartPulse,
    title: "Habits & Substance Tracking",
    desc: "Build discipline with habit streaks. Track smoking reduction and alcohol intake with streak analytics.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Everything you need
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built for real transformation
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Six powerful modules working together to keep you on track — day
            after day, month after month.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border bg-card p-6 space-y-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/50 border transition-transform duration-200 group-hover:scale-110">
                <f.icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
