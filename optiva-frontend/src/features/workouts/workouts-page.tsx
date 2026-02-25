import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import {
  Plus,
  Trash2,
  Dumbbell,
  Loader2,
  ChevronDown,
  Timer,
  Weight,
  Repeat,
  Layers,
  Zap,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { DataPagination } from "@/components/shared/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { workoutPlanApi } from "@/api/endpoints";
import type { WorkoutPlanResponse } from "@/types";

const optionalPositiveNumber = z.preprocess(
  (val) =>
    val === "" || val === undefined || val === null ? undefined : Number(val),
  z.number().positive().optional(),
);

const exerciseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sets: z.coerce.number({ message: "Required" }).min(1, "Min 1"),
  reps: z.coerce.number({ message: "Required" }).min(1, "Min 1"),
  weight: optionalPositiveNumber,
  duration: optionalPositiveNumber,
});

const workoutFormSchema = z.object({
  weekStartDate: z.string().min(1),
  dayOfWeek: z.coerce.number().min(1).max(7),
  sessionName: z.string().min(1, "Session name is required"),
  exercises: z.array(exerciseSchema).min(1, "Add at least one exercise"),
});

type WorkoutFormValues = z.infer<typeof workoutFormSchema>;

const DAYS = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function WorkoutsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    params,
    setPage,
    setSize,
    setSortBy,
    setSortDir,
    setDateFrom,
    setDateTo,
    reset: resetPagination,
  } = usePagination({ defaultSortBy: "weekStartDate" });

  const {
    data: pagedData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["workout-plans-paged", params],
    queryFn: () => workoutPlanApi.getAllPaged(params),
  });

  const entries = pagedData?.content ?? [];

  const form = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema) as never,
    defaultValues: {
      weekStartDate: format(new Date(), "yyyy-MM-dd"),
      dayOfWeek: 1,
      sessionName: "",
      exercises: [
        {
          name: "",
          sets: "" as unknown as number,
          reps: "" as unknown as number,
          weight: undefined,
          duration: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const createMutation = useMutation({
    mutationFn: (data: WorkoutFormValues) =>
      workoutPlanApi.create({
        weekStartDate: data.weekStartDate,
        days: [
          {
            dayOfWeek: data.dayOfWeek,
            sessions: [
              {
                name: data.sessionName,
                orderIndex: 1,
                exercises: data.exercises.map((e, i) => ({
                  ...e,
                  orderIndex: i + 1,
                })),
              },
            ],
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans-paged"] });
      toast.success("Workout plan created");
      closeDialog();
    },
    onError: () => toast.error("Failed to create workout plan"),
  });

  const deleteMutation = useMutation({
    mutationFn: workoutPlanApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans-paged"] });
      toast.success("Workout plan deleted");
    },
  });

  function closeDialog() {
    setDialogOpen(false);
    form.reset();
  }

  function onSubmit(values: WorkoutFormValues) {
    createMutation.mutate(values);
  }

  if (isLoading) return <PageSkeleton cards={3} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight">Workout Plans</h1>
          <p className="text-muted-foreground">
            Plan your weekly training sessions.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            if (!o) closeDialog();
            else setDialogOpen(true);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Workout Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Week Start</Label>
                  <Input type="date" {...form.register("weekStartDate")} />
                </div>
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select
                    onValueChange={(v) =>
                      form.setValue("dayOfWeek", parseInt(v))
                    }
                    defaultValue="1"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.slice(1).map((day, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Session Name</Label>
                <Input
                  placeholder="e.g. Upper Body Strength"
                  {...form.register("sessionName")}
                />
                {form.formState.errors.sessionName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.sessionName.message}
                  </p>
                )}
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Exercises</Label>
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="space-y-2 p-3 border rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">
                        Exercise {idx + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => remove(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Exercise name"
                      {...form.register(`exercises.${idx}.name`)}
                    />
                    {form.formState.errors.exercises?.[idx]?.name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.exercises[idx].name?.message}
                      </p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <Input
                          type="number"
                          placeholder="Sets *"
                          {...form.register(`exercises.${idx}.sets`)}
                        />
                        {form.formState.errors.exercises?.[idx]?.sets && (
                          <p className="text-xs text-destructive mt-0.5">
                            {form.formState.errors.exercises[idx].sets?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Reps *"
                          {...form.register(`exercises.${idx}.reps`)}
                        />
                        {form.formState.errors.exercises?.[idx]?.reps && (
                          <p className="text-xs text-destructive mt-0.5">
                            {form.formState.errors.exercises[idx].reps?.message}
                          </p>
                        )}
                      </div>
                      <Input
                        type="number"
                        placeholder="Weight"
                        step="0.5"
                        {...form.register(`exercises.${idx}.weight`)}
                      />
                      <Input
                        type="number"
                        placeholder="Duration"
                        step="0.5"
                        {...form.register(`exercises.${idx}.duration`)}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1"
                  onClick={() =>
                    append({
                      name: "",
                      sets: "" as unknown as number,
                      reps: "" as unknown as number,
                      weight: undefined,
                      duration: undefined,
                    })
                  }
                >
                  <Plus className="h-3 w-3" /> Add Exercise
                </Button>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Plan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataToolbar
        showDateRange
        dateFrom={params.dateFrom}
        dateTo={params.dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        showSort
        sortOptions={[{ value: "weekStartDate", label: "Week Start" }]}
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSortByChange={setSortBy}
        onSortDirChange={setSortDir}
        onReset={resetPagination}
      />

      {entries.length === 0 ? (
        <EmptyState
          title="No workout plans"
          description="Create a plan to start training."
          action={
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> New Plan
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {entries.map((plan) => (
            <WorkoutPlanCard
              key={plan.id}
              plan={plan}
              onDelete={() => deleteMutation.mutate(plan.id)}
            />
          ))}
          <DataPagination
            page={pagedData?.page ?? 0}
            totalPages={pagedData?.totalPages ?? 0}
            totalElements={pagedData?.totalElements ?? 0}
            size={pagedData?.size ?? 10}
            onPageChange={setPage}
            onSizeChange={setSize}
          />
        </div>
      )}
    </div>
  );
}

function WorkoutPlanCard({
  plan,
  onDelete,
}: {
  plan: WorkoutPlanResponse;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sortedDays = [...plan.days].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  // Compute totals across all days
  const totals = plan.days.reduce(
    (acc, day) => {
      day.sessions.forEach((session) => {
        acc.sessions += 1;
        session.exercises.forEach((ex) => {
          acc.exercises += 1;
          acc.totalSets += ex.sets || 0;
        });
      });
      return acc;
    },
    { sessions: 0, exercises: 0, totalSets: 0 },
  );

  // Collect all unique session names for pills
  const allSessionNames = Array.from(
    new Set(plan.days.flatMap((d) => d.sessions.map((s) => s.name))),
  );

  // Color palette for sessions (cycles)
  const sessionColors = [
    {
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
      badgeBg:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
    },
    {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
      badgeBg:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    {
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800",
      badgeBg:
        "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
      iconBg: "bg-violet-100 dark:bg-violet-900/40",
    },
    {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
      badgeBg:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      iconBg: "bg-amber-100 dark:bg-amber-900/40",
    },
    {
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
      badgeBg:
        "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
      iconBg: "bg-rose-100 dark:bg-rose-900/40",
    },
  ];

  // Session name → color map
  const sessionColorMap = new Map<string, (typeof sessionColors)[0]>();
  allSessionNames.forEach((name, i) => {
    sessionColorMap.set(name, sessionColors[i % sessionColors.length]);
  });

  return (
    <Card className="shadow-md overflow-hidden transition-all duration-200">
      {/* Compact clickable header — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Icon */}
        <div className="h-9 w-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
          <Dumbbell className="h-4 w-4 text-primary" />
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            Week of {format(parseISO(plan.weekStartDate), "MMM d, yyyy")}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {sortedDays.length} day{sortedDays.length !== 1 ? "s" : ""}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground">
              {totals.exercises} exercise{totals.exercises !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Session pills */}
        <div className="hidden sm:flex items-center gap-2">
          {allSessionNames.slice(0, 3).map((name) => {
            const cfg = sessionColorMap.get(name)!;
            return (
              <span
                key={name}
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.badgeBg}`}
              >
                <Zap className="h-3 w-3" />
                {name}
              </span>
            );
          })}
          {allSessionNames.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{allSessionNames.length - 3}
            </span>
          )}
        </div>

        {/* Compact stats */}
        <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3 text-blue-400" />
            {totals.sessions} session{totals.sessions !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3 text-emerald-400" />
            {totals.totalSets} sets
          </span>
        </div>

        {/* Actions */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t">
          <CardContent className="p-4 space-y-4">
            {/* Summary stats bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <Target className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none">
                    Sessions
                  </p>
                  <p className="text-sm font-semibold mt-0.5">
                    {totals.sessions}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <Dumbbell className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none">
                    Exercises
                  </p>
                  <p className="text-sm font-semibold mt-0.5">
                    {totals.exercises}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30">
                <Layers className="h-4 w-4 text-violet-500" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none">
                    Total Sets
                  </p>
                  <p className="text-sm font-semibold mt-0.5">
                    {totals.totalSets}
                  </p>
                </div>
              </div>
            </div>

            {/* Day tabs */}
            <Tabs
              defaultValue={String(sortedDays[0]?.dayOfWeek ?? 1)}
              className="w-full"
            >
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
                {sortedDays.map((day) => (
                  <TabsTrigger
                    key={day.dayOfWeek}
                    value={String(day.dayOfWeek)}
                    className="text-xs px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    {DAYS[day.dayOfWeek]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {sortedDays.map((day) => {
                const daySessions = [...day.sessions].sort(
                  (a, b) => a.orderIndex - b.orderIndex,
                );
                const dayExerciseCount = daySessions.reduce(
                  (sum, s) => sum + s.exercises.length,
                  0,
                );

                return (
                  <TabsContent
                    key={day.dayOfWeek}
                    value={String(day.dayOfWeek)}
                    className="mt-3 space-y-3"
                  >
                    {/* Per-day summary */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground px-1">
                      <span className="font-medium text-foreground">
                        {DAYS[day.dayOfWeek]}:
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-blue-400" />
                        {daySessions.length} session
                        {daySessions.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3 text-emerald-400" />
                        {dayExerciseCount} exercise
                        {dayExerciseCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Session sections */}
                    <div className="grid gap-3">
                      {daySessions.map((session) => {
                        const cfg =
                          sessionColorMap.get(session.name) ?? sessionColors[0];

                        return (
                          <div
                            key={session.id}
                            className={`rounded-lg border p-3 ${cfg.bg}`}
                          >
                            {/* Session header */}
                            <div className="flex items-center justify-between mb-2.5">
                              <div
                                className={`flex items-center gap-2 ${cfg.color}`}
                              >
                                <Zap className="h-3.5 w-3.5" />
                                <span className="text-sm font-semibold">
                                  {session.name}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.badgeBg}`}
                              >
                                {session.exercises.length} exercise
                                {session.exercises.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            {/* Exercise list */}
                            <div className="space-y-2">
                              {[...session.exercises]
                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                .map((ex) => (
                                  <div
                                    key={ex.id}
                                    className="flex items-center justify-between bg-background/60 dark:bg-background/30 rounded-md px-3 py-2"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div
                                        className={`h-6 w-6 rounded-md ${cfg.iconBg} flex items-center justify-center shrink-0`}
                                      >
                                        <span
                                          className={`text-[10px] font-bold ${cfg.color}`}
                                        >
                                          {ex.orderIndex}
                                        </span>
                                      </div>
                                      <span className="text-sm font-medium truncate">
                                        {ex.name}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                                      {ex.sets && ex.reps ? (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Repeat className="h-3 w-3" />
                                          <span className="font-medium text-foreground">
                                            {ex.sets} × {ex.reps}
                                          </span>
                                        </span>
                                      ) : null}
                                      {ex.weight ? (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Weight className="h-3 w-3" />
                                          <span className="font-medium text-foreground">
                                            {ex.weight}
                                          </span>
                                        </span>
                                      ) : null}
                                      {ex.duration ? (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <Timer className="h-3 w-3" />
                                          <span className="font-medium text-foreground">
                                            {ex.duration} min
                                          </span>
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </div>
      )}
    </Card>
  );
}
