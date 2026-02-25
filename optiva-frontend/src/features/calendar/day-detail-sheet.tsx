import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import type { CalendarDayResponse } from "@/types";
import {
  Scale,
  BookOpen,
  Target,
  Cigarette,
  Wine,
  UtensilsCrossed,
  Dumbbell,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  dayData: CalendarDayResponse | null;
}

export function DayDetailSheet({ open, onOpenChange, date, dayData }: Props) {
  const navigate = useNavigate();

  if (!date) return null;

  const indicators = [
    {
      icon: Scale,
      label: "Weight",
      active: dayData?.hasWeight ?? false,
      link: "/weight",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: BookOpen,
      label: "Journal",
      active: dayData?.hasJournal ?? false,
      link: "/journal",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      icon: UtensilsCrossed,
      label: "Meal Plan",
      active: dayData?.hasMealPlan ?? false,
      link: "/meals",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      icon: Dumbbell,
      label: "Workout",
      active: dayData?.hasWorkoutPlan ?? false,
      link: "/workouts",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      icon: Cigarette,
      label: "Smoking",
      active: dayData?.hasSmokingLog ?? false,
      link: "/smoking",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      icon: Wine,
      label: "Alcohol",
      active: dayData?.hasAlcoholLog ?? false,
      link: "/alcohol",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  const activeCount = indicators.filter((i) => i.active).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 space-y-1">
          <SheetTitle className="text-lg">
            {format(date, "EEEE, MMMM d")}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <span>{format(date, "yyyy")}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>
              {activeCount > 0
                ? `${activeCount} activit${activeCount === 1 ? "y" : "ies"} logged`
                : "No activity logged"}
            </span>
          </SheetDescription>
        </SheetHeader>

        <Separator />

        {/* Content — scrollable area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Habits card */}
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="rounded-md bg-emerald-500/10 p-1.5">
                  <Target className="h-4 w-4 text-emerald-500" />
                </div>
                Habits
              </div>
              {dayData && dayData.habitTotalCount > 0 && (
                <Badge
                  variant={
                    dayData.habitDoneCount === dayData.habitTotalCount
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {dayData.habitDoneCount}/{dayData.habitTotalCount}
                </Badge>
              )}
            </div>
            {dayData && dayData.habitTotalCount > 0 ? (
              <div className="flex gap-1">
                {Array.from({ length: dayData.habitTotalCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < dayData.habitDoneCount ? "bg-emerald-500" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No habits tracked for this day.
              </p>
            )}
          </div>

          {/* Activity list */}
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Activities
            </h3>
            <div className="space-y-1">
              {indicators.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    onOpenChange(false);
                    navigate(item.link);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60 group"
                >
                  {/* Icon */}
                  <div className={`rounded-md p-1.5 ${item.bg} shrink-0`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>

                  {/* Label */}
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>

                  {/* Status */}
                  {item.active ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  )}

                  {/* Arrow */}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
