import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PLANS = [
  {
    name: "Personal",
    price: "Free",
    period: "forever",
    desc: "Everything you need for your transformation journey.",
    cta: "Get Started",
    ctaVariant: "default" as const,
    highlight: false,
    features: [
      "Unlimited weight tracking",
      "Weekly meal & workout plans",
      "Daily journal entries",
      "Habit, smoking & alcohol tracking",
      "Milestone checkpoints",
      "Calendar view",
      "Basic analytics",
    ],
  },
  {
    name: "Pro",
    price: "Coming soon",
    period: "",
    desc: "Advanced analytics, AI insights, and community features.",
    cta: "Join Waitlist",
    ctaVariant: "outline" as const,
    highlight: true,
    features: [
      "Everything in Personal",
      "Advanced trend analytics",
      "AI-powered meal suggestions",
      "Progress photo timeline",
      "Export data (CSV/PDF)",
      "Priority support",
      "Community challenges",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-muted/20 border-y">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Free for personal use
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Start transforming today — no credit card required. Pro features
            coming soon.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                plan.highlight ? "border-foreground/20 shadow-md" : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-foreground text-background text-[10px] px-3 py-1 gap-1">
                    <Sparkles className="h-3 w-3" /> Coming Soon
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.desc}</CardDescription>
                <div className="pt-3">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground ml-1">
                      / {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="pt-5 space-y-4">
                <ul className="space-y-2.5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-foreground" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.ctaVariant}
                  asChild={plan.ctaVariant === "default"}
                  disabled={plan.ctaVariant === "outline"}
                >
                  {plan.ctaVariant === "default" ? (
                    <Link to="/register">{plan.cta}</Link>
                  ) : (
                    <span>{plan.cta}</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
