import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-16 sm:px-16 sm:py-20 text-center shadow-2xl">
          {/* Subtle glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center">
              <img
                src="/mind.png"
                alt="Optivita"
                className="h-14 w-14 invert dark:invert-0"
              />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-background tracking-tight">
              Start your transformation mission
            </h2>
            <p className="mt-4 text-lg text-background/70 max-w-xl mx-auto leading-relaxed">
              Join Optivita and take control of your health — one checkpoint at
              a time. Free forever for personal use.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto gap-2 bg-background text-foreground shadow-lg hover:bg-background/90 transition-all font-semibold"
              >
                <Link to="/register">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-background/30 text-background hover:bg-background/10 hover:text-background"
              >
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
