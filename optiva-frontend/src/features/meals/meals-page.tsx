import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import {
  Plus,
  Trash2,
  UtensilsCrossed,
  Loader2,
  Copy,
  Sun,
  Coffee,
  Moon,
  Apple,
  Flame,
  Beef,
  Wheat,
  Droplets,
  ChevronDown,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { DataPagination } from "@/components/shared/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { mealPlanApi } from "@/api/endpoints";
import type { MealPlanResponse, MealType } from "@/types";

const mealItemSchema = z.object({
  name: z.string().min(1),
  portion: z.string().optional(),
  calories: z.coerce.number().optional(),
  proteinG: z.coerce.number().optional(),
  carbsG: z.coerce.number().optional(),
  fatG: z.coerce.number().optional(),
});

const mealSchema = z.object({
  weekStartDate: z.string().min(1),
  dayOfWeek: z.coerce.number().min(1).max(7),
  mealType: z.string().min(1),
  items: z.array(mealItemSchema).min(1, "Add at least one item"),
});

type MealFormValues = z.infer<typeof mealSchema>;

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
const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACK", label: "Snack" },
];

export default function MealsPage() {
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
    queryKey: ["meal-plans-paged", params],
    queryFn: () => mealPlanApi.getAllPaged(params),
  });

  const entries = pagedData?.content ?? [];

  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema) as never,
    defaultValues: {
      weekStartDate: format(new Date(), "yyyy-MM-dd"),
      dayOfWeek: 1,
      mealType: "BREAKFAST",
      items: [
        {
          name: "",
          portion: "",
          calories: undefined,
          proteinG: undefined,
          carbsG: undefined,
          fatG: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const createMutation = useMutation({
    mutationFn: (data: MealFormValues) =>
      mealPlanApi.create({
        weekStartDate: data.weekStartDate,
        days: [
          {
            dayOfWeek: data.dayOfWeek,
            meals: [{ mealType: data.mealType as MealType, items: data.items }],
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans-paged"] });
      toast.success("Meal plan created");
      closeDialog();
    },
    onError: () => toast.error("Failed to create meal plan"),
  });

  const deleteMutation = useMutation({
    mutationFn: mealPlanApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans-paged"] });
      toast.success("Meal plan deleted");
    },
  });

  const copyMutation = useMutation({
    mutationFn: (weekStartDate: string) =>
      mealPlanApi.copyLastWeek(weekStartDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans-paged"] });
      toast.success("Last week's plan copied");
    },
    onError: () => toast.error("Failed to copy plan"),
  });

  function closeDialog() {
    setDialogOpen(false);
    form.reset();
  }

  function onSubmit(values: MealFormValues) {
    createMutation.mutate(values);
  }

  if (isLoading) return <PageSkeleton cards={3} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight">Meal Planning</h1>
          <p className="text-muted-foreground">
            Plan your weekly meals and track nutrition.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              copyMutation.mutate(format(new Date(), "yyyy-MM-dd"))
            }
          >
            <Copy className="h-4 w-4" /> Copy Last Week
          </Button>
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
                <DialogTitle>New Meal Plan</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                  <Label>Meal Type</Label>
                  <Select
                    onValueChange={(v) => form.setValue("mealType", v)}
                    defaultValue="BREAKFAST"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label>Items</Label>
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="space-y-2 p-3 border rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">
                          Item {idx + 1}
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
                        placeholder="Name"
                        {...form.register(`items.${idx}.name`)}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          placeholder="Portion"
                          {...form.register(`items.${idx}.portion`)}
                        />
                        <Input
                          type="number"
                          placeholder="Calories"
                          {...form.register(`items.${idx}.calories`)}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 [&_input]:min-h-[44px]">
                        <Input
                          type="number"
                          placeholder="Protein"
                          {...form.register(`items.${idx}.proteinG`)}
                        />
                        <Input
                          type="number"
                          placeholder="Carbs"
                          {...form.register(`items.${idx}.carbsG`)}
                        />
                        <Input
                          type="number"
                          placeholder="Fat"
                          {...form.register(`items.${idx}.fatG`)}
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
                        portion: "",
                        calories: undefined,
                        proteinG: undefined,
                        carbsG: undefined,
                        fatG: undefined,
                      })
                    }
                  >
                    <Plus className="h-3 w-3" /> Add Item
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
          title="No meal plans"
          description="Create a meal plan to start tracking your nutrition."
          action={
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> New Plan
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {entries.map((plan) => (
            <MealPlanCard
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

function MealPlanCard({
  plan,
  onDelete,
}: {
  plan: MealPlanResponse;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sortedDays = [...plan.days].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  // Compute total nutrition across all days
  const totals = plan.days.reduce(
    (acc, day) => {
      day.meals.forEach((meal) =>
        meal.items.forEach((item) => {
          acc.calories += item.calories || 0;
          acc.protein += item.proteinG || 0;
          acc.carbs += item.carbsG || 0;
          acc.fat += item.fatG || 0;
          acc.items += 1;
        }),
      );
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, items: 0 },
  );

  // Collect all unique meal types for the summary
  const allMealTypes = Array.from(
    new Set(plan.days.flatMap((d) => d.meals.map((m) => m.mealType))),
  );

  const mealTypeConfig: Record<
    string,
    { icon: React.ReactNode; color: string; bg: string; badgeBg: string }
  > = {
    BREAKFAST: {
      icon: <Coffee className="h-3.5 w-3.5" />,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
      badgeBg:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
    LUNCH: {
      icon: <Sun className="h-3.5 w-3.5" />,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
      badgeBg:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    },
    DINNER: {
      icon: <Moon className="h-3.5 w-3.5" />,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800",
      badgeBg:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    },
    SNACK: {
      icon: <Apple className="h-3.5 w-3.5" />,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
      badgeBg:
        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    },
  };

  return (
    <Card className="shadow-md overflow-hidden transition-all duration-200">
      {/* Compact clickable header — always visible */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Icon */}
        <div className="h-9 w-9 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
          <UtensilsCrossed className="h-4 w-4 text-primary" />
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
              {totals.items} item{totals.items !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Inline macro pills */}
        <div className="hidden sm:flex items-center gap-2">
          {allMealTypes.map((mt) => {
            const cfg = mealTypeConfig[mt];
            return cfg ? (
              <span
                key={mt}
                className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.badgeBg}`}
              >
                {cfg.icon}
                {mt.charAt(0) + mt.slice(1).toLowerCase()}
              </span>
            ) : null;
          })}
        </div>

        {/* Compact nutrition summary */}
        <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-red-400" />
            {totals.calories}
          </span>
          <span className="flex items-center gap-1">
            <Beef className="h-3 w-3 text-blue-400" />
            {totals.protein}g
          </span>
          <span className="flex items-center gap-1">
            <Wheat className="h-3 w-3 text-yellow-500" />
            {totals.carbs}g
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3 text-purple-400" />
            {totals.fat}g
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
            {/* Nutrition Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                <Flame className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none">
                    Calories
                  </p>
                  <p className="text-sm font-semibold mt-0.5">
                    {totals.calories}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                <Beef className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none">
                    Protein
                  </p>
                  <p className="text-sm font-semibold mt-0.5">
                    {totals.protein}g
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30">
                <Wheat className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none">
                    Carbs
                  </p>
                  <p className="text-sm font-semibold mt-0.5">
                    {totals.carbs}g
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                <Droplets className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none">
                    Fat
                  </p>
                  <p className="text-sm font-semibold mt-0.5">{totals.fat}g</p>
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
                const dayTotals = day.meals.reduce(
                  (acc, meal) => {
                    meal.items.forEach((item) => {
                      acc.calories += item.calories || 0;
                      acc.protein += item.proteinG || 0;
                      acc.carbs += item.carbsG || 0;
                      acc.fat += item.fatG || 0;
                    });
                    return acc;
                  },
                  { calories: 0, protein: 0, carbs: 0, fat: 0 },
                );

                return (
                  <TabsContent
                    key={day.dayOfWeek}
                    value={String(day.dayOfWeek)}
                    className="mt-3 space-y-3"
                  >
                    {/* Per-day nutrition mini bar */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground px-1">
                      <span className="font-medium text-foreground">
                        {DAYS[day.dayOfWeek]} totals:
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-red-400" />
                        {dayTotals.calories} cal
                      </span>
                      <span className="flex items-center gap-1">
                        <Beef className="h-3 w-3 text-blue-400" />
                        {dayTotals.protein}g P
                      </span>
                      <span className="flex items-center gap-1">
                        <Wheat className="h-3 w-3 text-yellow-500" />
                        {dayTotals.carbs}g C
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-purple-400" />
                        {dayTotals.fat}g F
                      </span>
                    </div>

                    {/* Meal sections */}
                    <div className="grid gap-3">
                      {day.meals.map((meal) => {
                        const cfg = mealTypeConfig[meal.mealType] ?? {
                          icon: <UtensilsCrossed className="h-3.5 w-3.5" />,
                          color: "text-gray-600",
                          bg: "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800",
                          badgeBg: "bg-gray-100 text-gray-700",
                        };

                        const mealCals = meal.items.reduce(
                          (s, i) => s + (i.calories || 0),
                          0,
                        );

                        return (
                          <div
                            key={meal.id}
                            className={`rounded-lg border p-3 ${cfg.bg}`}
                          >
                            {/* Meal type header */}
                            <div className="flex items-center justify-between mb-2.5">
                              <div
                                className={`flex items-center gap-2 ${cfg.color}`}
                              >
                                {cfg.icon}
                                <span className="text-sm font-semibold capitalize">
                                  {meal.mealType.toLowerCase()}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">
                                {mealCals} cal
                              </span>
                            </div>

                            {/* Meal items */}
                            <div className="space-y-2">
                              {meal.items.map((item) => {
                                const totalMacro =
                                  (item.proteinG || 0) +
                                  (item.carbsG || 0) +
                                  (item.fatG || 0);
                                const proteinPct =
                                  totalMacro > 0
                                    ? ((item.proteinG || 0) / totalMacro) * 100
                                    : 0;
                                const carbsPct =
                                  totalMacro > 0
                                    ? ((item.carbsG || 0) / totalMacro) * 100
                                    : 0;
                                const fatPct =
                                  totalMacro > 0
                                    ? ((item.fatG || 0) / totalMacro) * 100
                                    : 0;

                                return (
                                  <div
                                    key={item.id}
                                    className="bg-background/60 rounded-md p-2.5 border border-border/50"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {item.name}
                                        </p>
                                        {item.portion && (
                                          <p className="text-xs text-muted-foreground mt-0.5">
                                            {item.portion}
                                          </p>
                                        )}
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="shrink-0 text-xs font-medium"
                                      >
                                        {item.calories} cal
                                      </Badge>
                                    </div>

                                    {/* Macro bar */}
                                    {totalMacro > 0 && (
                                      <div className="mt-2 space-y-1.5">
                                        <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-muted">
                                          <div
                                            className="h-full bg-blue-500 transition-all"
                                            style={{ width: `${proteinPct}%` }}
                                          />
                                          <div
                                            className="h-full bg-yellow-500 transition-all"
                                            style={{ width: `${carbsPct}%` }}
                                          />
                                          <div
                                            className="h-full bg-purple-500 transition-all"
                                            style={{ width: `${fatPct}%` }}
                                          />
                                        </div>
                                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            P {item.proteinG}g
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                            C {item.carbsG}g
                                          </span>
                                          <span className="flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                            F {item.fatG}g
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
