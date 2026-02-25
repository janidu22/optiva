import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calendarApi } from "@/api/endpoints";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { DayDetailSheet } from "./day-detail-sheet";
import type { CalendarDayResponse } from "@/types";
import { Scale, BookOpen, Target, Cigarette, Wine } from "lucide-react";

export default function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);

  const from = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
  const to = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["calendar", from, to],
    queryFn: () => calendarApi.get(from, to),
  });

  const dayMap = useMemo(() => {
    const map = new Map<string, CalendarDayResponse>();
    data?.days?.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  const selectedDayData = selectedDate
    ? (dayMap.get(format(selectedDate, "yyyy-MM-dd")) ?? null)
    : null;

  if (isLoading) return <PageSkeleton cards={1} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const summaryItems = [
    {
      icon: Scale,
      label: "Weight",
      count: data?.totals?.daysWithWeight ?? 0,
      color: "text-blue-500",
    },
    {
      icon: BookOpen,
      label: "Journal",
      count: data?.totals?.daysWithJournal ?? 0,
      color: "text-violet-500",
    },
    {
      icon: Target,
      label: "Habits",
      count: `${data?.totals?.totalHabitsDone ?? 0}/${data?.totals?.totalHabitsLogged ?? 0}`,
      color: "text-emerald-500",
    },
    {
      icon: Cigarette,
      label: "Smoking",
      count: data?.totals?.daysWithSmokingLog ?? 0,
      color: "text-amber-500",
    },
    {
      icon: Wine,
      label: "Alcohol",
      count: data?.totals?.daysWithAlcoholLog ?? 0,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="flex flex-col gap-4 min-h-0 h-[calc(100dvh-8rem)] sm:h-[calc(100dvh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm">
            Tap a day to view activity details.
          </p>
        </div>
        <Badge variant="outline" className="text-xs hidden sm:flex">
          {format(selectedMonth, "MMMM yyyy")}
        </Badge>
      </div>

      {/* Monthly summary pills — horizontal on all screens */}
      <div className="flex gap-2 overflow-x-auto shrink-0 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {summaryItems.map((item) => (
          <Card key={item.label} className="shadow-sm shrink-0 min-w-0">
            <CardContent className="flex items-center gap-2 px-3 py-2">
              <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {item.label}
              </span>
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 ml-auto"
              >
                {item.count}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar — fills remaining space */}
      <Card className="shadow-md flex-1 min-h-0 flex flex-col overflow-hidden min-w-0">
        <CardContent className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
                setSheetOpen(true);
              }
            }}
            onMonthChange={setSelectedMonth}
            className="w-full max-w-lg mx-auto"
            modifiers={{
              hasData:
                data?.days
                  ?.filter(
                    (d) =>
                      d.hasWeight ||
                      d.hasJournal ||
                      d.habitDoneCount > 0 ||
                      d.hasSmokingLog ||
                      d.hasAlcoholLog,
                  )
                  .map((d) => parseISO(d.date)) ?? [],
            }}
            modifiersClassNames={{
              hasData:
                "bg-primary/10 font-semibold ring-1 ring-primary/20 rounded-md",
            }}
          />
        </CardContent>
      </Card>

      <DayDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        date={selectedDate ?? null}
        dayData={selectedDayData}
      />
    </div>
  );
}
