import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, Pencil, Wine, Loader2, Droplets } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { DataPagination } from "@/components/shared/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { alcoholApi } from "@/api/endpoints";
import type { AlcoholLogResponse, DrinkType } from "@/types";

const alcoholSchema = z.object({
  date: z.string().min(1),
  drinkType: z.string().min(1),
  customName: z.string().optional(),
  units: z.coerce.number().positive("Units must be > 0"),
  volumeMl: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type AlcoholFormValues = z.infer<typeof alcoholSchema>;

const DRINK_TYPES: { value: DrinkType; label: string; emoji: string }[] = [
  { value: "BEER", label: "Beer", emoji: "🍺" },
  { value: "WINE", label: "Wine", emoji: "🍷" },
  { value: "SPIRITS", label: "Spirits", emoji: "🥃" },
  { value: "CUSTOM", label: "Custom", emoji: "🍹" },
];

const chartConfig: ChartConfig = {
  totalUnits: { label: "Units", color: "var(--chart-4)" },
};

export default function AlcoholPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AlcoholLogResponse | null>(
    null,
  );
  const {
    params,
    setPage,
    setSize,
    setSortBy,
    setSortDir,
    setDateFrom,
    setDateTo,
    setDrinkType: setFilterDrinkType,
    reset,
  } = usePagination({ defaultSortBy: "logDate" });

  const {
    data: pagedData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["alcohol-paged", params],
    queryFn: () => alcoholApi.getAllPaged(params),
  });

  const { data: analytics } = useQuery({
    queryKey: ["alcohol-analytics"],
    queryFn: alcoholApi.getAnalytics,
  });

  const form = useForm<AlcoholFormValues>({
    resolver: zodResolver(alcoholSchema) as never,
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      drinkType: "BEER",
      customName: "",
      units: undefined,
      volumeMl: undefined,
      notes: "",
    },
  });

  const drinkType = form.watch("drinkType");

  const createMutation = useMutation({
    mutationFn: (data: AlcoholFormValues) =>
      alcoholApi.create({ ...data, drinkType: data.drinkType as DrinkType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alcohol-paged"] });
      queryClient.invalidateQueries({ queryKey: ["alcohol-analytics"] });
      toast.success("Alcohol log added");
      closeDialog();
    },
    onError: () => toast.error("Failed to add log"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AlcoholFormValues }) =>
      alcoholApi.update(id, {
        ...data,
        drinkType: data.drinkType as DrinkType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alcohol-paged"] });
      queryClient.invalidateQueries({ queryKey: ["alcohol-analytics"] });
      toast.success("Log updated");
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: alcoholApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alcohol-paged"] });
      queryClient.invalidateQueries({ queryKey: ["alcohol-analytics"] });
      toast.success("Log deleted");
    },
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingEntry(null);
    form.reset();
  }

  function openEdit(entry: AlcoholLogResponse) {
    setEditingEntry(entry);
    form.reset({
      date: entry.date,
      drinkType: entry.drinkType,
      customName: entry.customName || "",
      units: entry.units,
      volumeMl: entry.volumeMl || undefined,
      notes: entry.notes || "",
    });
    setDialogOpen(true);
  }

  function onSubmit(values: AlcoholFormValues) {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (isLoading) return <PageSkeleton cards={4} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const entries = pagedData?.content ?? [];

  const trendData = (analytics?.monthlyTrend ?? []).map((m) => ({
    month: m.month,
    totalUnits: m.totalUnits,
  }));

  const drinkEmoji = (type: DrinkType) =>
    DRINK_TYPES.find((d) => d.value === type)?.emoji ?? "🍹";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight">Alcohol Tracker</h1>
          <p className="text-muted-foreground">
            Monitor alcohol consumption and progress.
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
              <Plus className="h-4 w-4" /> Log Drink
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit" : "New"} Alcohol Log
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div className="space-y-2">
                <Label>Drink Type</Label>
                <Select
                  value={drinkType}
                  onValueChange={(v) => form.setValue("drinkType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DRINK_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.emoji} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {drinkType === "CUSTOM" && (
                <div className="space-y-2">
                  <Label>Custom Name</Label>
                  <Input
                    placeholder="e.g. Cocktail"
                    {...form.register("customName")}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Units</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min={0}
                    placeholder="e.g. 2"
                    {...form.register("units")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Volume (ml)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 330"
                    {...form.register("volumeMl")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Context..."
                  {...form.register("notes")}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingEntry ? "Update" : "Save"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Card className="shadow-md overflow-hidden min-w-0">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Wine className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">This week</div>
                <div className="text-2xl font-bold">
                  {analytics.unitsThisWeek} units
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md overflow-hidden min-w-0">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Droplets className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Alcohol-free streak
                </div>
                <div className="text-2xl font-bold">
                  {analytics.alcoholFreeStreak} days
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md overflow-hidden min-w-0 sm:col-span-2 md:col-span-1">
            <CardContent className="pt-6">
              {trendData.length > 0 ? (
                <ChartContainer
                  config={chartConfig}
                  className="h-[80px] w-full"
                >
                  <BarChart data={trendData}>
                    <XAxis dataKey="month" hide />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="totalUnits"
                      fill="var(--color-totalUnits)"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No trend data</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Separator />

      {/* Toolbar */}
      <DataToolbar
        showDateRange
        dateFrom={params.dateFrom ?? ""}
        dateTo={params.dateTo ?? ""}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        showSort
        sortOptions={[
          { label: "Date", value: "logDate" },
          { label: "Units", value: "units" },
          { label: "Volume", value: "volumeMl" },
        ]}
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSortByChange={setSortBy}
        onSortDirChange={setSortDir}
        onReset={reset}
      >
        {/* DrinkType filter */}
        <Select
          value={params.drinkType ?? "ALL"}
          onValueChange={(v) => setFilterDrinkType(v === "ALL" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {DRINK_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.emoji} {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DataToolbar>

      {entries.length === 0 ? (
        <EmptyState
          title="No alcohol logs"
          description="Log your drinks to start tracking."
          action={
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Log Drink
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CardContent className="flex items-center justify-between gap-2 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-lg">
                    {drinkEmoji(entry.drinkType)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {entry.drinkType === "CUSTOM"
                        ? entry.customName
                        : entry.drinkType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(entry.date), "MMM d, yyyy")}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {entry.units} unit{entry.units !== 1 ? "s" : ""}
                  </Badge>
                  {entry.volumeMl > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs hidden sm:inline-flex"
                    >
                      {entry.volumeMl}ml
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(entry)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => deleteMutation.mutate(entry.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagedData && (
            <DataPagination
              page={pagedData.page}
              totalPages={pagedData.totalPages}
              totalElements={pagedData.totalElements}
              size={pagedData.size}
              onPageChange={setPage}
              onSizeChange={setSize}
            />
          )}
        </div>
      )}
    </div>
  );
}
