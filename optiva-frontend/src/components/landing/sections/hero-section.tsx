import { Link } from "react-router-dom";
import { ArrowRight, TrendingDown, Flame, Moon, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-400/5" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="text-center lg:text-left">
            <Badge
              variant="secondary"
              className="mb-4 gap-1.5 px-3 py-1 text-xs font-medium"
            >
              <Sparkles className="h-3 w-3" />
              Long-term transformation system
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Your mission to a{" "}
              <span className="text-blue-600 dark:text-blue-400">
                better you
              </span>{" "}
              starts here.
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Set checkpoints across months and years. Plan meals & workouts
              weekly. Journal daily. Track habits, smoking, alcohol — and
              actually transform.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Button size="lg" asChild className="w-full sm:w-auto gap-2">
                <Link to="/register">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto"
              >
                <a href="#features">View Features</a>
              </Button>
            </div>
          </div>

          {/* Right — Minimal dashboard preview */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-2xl border bg-card shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Dashboard Preview</h3>
                <Badge variant="outline" className="text-[10px]">
                  Live
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Weight widget */}
                <div className="rounded-xl border bg-muted/30 p-3 space-y-1.5">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  <p className="text-lg font-bold">-4.2 kg</p>
                  <p className="text-[10px] text-muted-foreground">
                    Weight trend
                  </p>
                </div>

                {/* Streak widget */}
                <div className="rounded-xl border bg-muted/30 p-3 space-y-1.5">
                  <Flame className="h-4 w-4 text-foreground" />
                  <p className="text-lg font-bold">14 days</p>
                  <p className="text-[10px] text-muted-foreground">
                    Habit streak
                  </p>
                </div>

                {/* Sleep widget */}
                <div className="rounded-xl border bg-muted/30 p-3 space-y-1.5">
                  <Moon className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-bold">7.5 hrs</p>
                  <p className="text-[10px] text-muted-foreground">Avg sleep</p>
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Weekly progress
                </p>
                <div className="flex items-end gap-1.5 h-16">
                  {[45, 60, 55, 70, 65, 80, 75].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-foreground/15 dark:bg-foreground/20"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
