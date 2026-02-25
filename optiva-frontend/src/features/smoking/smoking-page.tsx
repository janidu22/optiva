import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import {
  Plus,
  Trash2,
  Pencil,
  Cigarette,
  Loader2,
  Flame,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { smokingApi } from "@/api/endpoints";
import type { SmokingLogResponse } from "@/types";

const smokingSchema = z.object({
  date: z.string().min(1),
  smokeFree: z.boolean(),
  cigarettesCount: z.coerce.number().min(0).optional(),
  cravings: z.coerce.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

type SmokingFormValues = z.infer<typeof smokingSchema>;

const chartConfig: ChartConfig = {
  cigarettesCount: { label: "Cigarettes", color: "var(--chart-5)" },
};

export default function SmokingPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SmokingLogResponse | null>(
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
    reset,
  } = usePagination({ defaultSortBy: "logDate" });

  const {
    data: pagedData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["smoking-paged", params],
    queryFn: () => smokingApi.getAllPaged(params),
  });

  const { data: analytics } = useQuery({
    queryKey: ["smoking-analytics"],
    queryFn: smokingApi.getAnalytics,
  });

  const form = useForm<SmokingFormValues>({
    resolver: zodResolver(smokingSchema) as never,
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      smokeFree: false,
      cigarettesCount: undefined,
      cravings: undefined,
      notes: "",
    },
  });

  const smokeFree = form.watch("smokeFree");

  const createMutation = useMutation({
    mutationFn: smokingApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smoking-paged"] });
      queryClient.invalidateQueries({ queryKey: ["smoking-analytics"] });
      toast.success("Smoking log added");
      closeDialog();
    },
    onError: () => toast.error("Failed to add log"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SmokingFormValues }) =>
      smokingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smoking-paged"] });
      queryClient.invalidateQueries({ queryKey: ["smoking-analytics"] });
      toast.success("Log updated");
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: smokingApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smoking-paged"] });
      queryClient.invalidateQueries({ queryKey: ["smoking-analytics"] });
      toast.success("Log deleted");
    },
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingEntry(null);
    form.reset();
  }

  function openEdit(entry: SmokingLogResponse) {
    setEditingEntry(entry);
    form.reset({
      date: entry.date,
      smokeFree: entry.smokeFree,
      cigarettesCount: entry.cigarettesCount,
      cravings: entry.cravings || undefined,
      notes: entry.notes || "",
    });
    setDialogOpen(true);
  }

  function onSubmit(values: SmokingFormValues) {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (isLoading) return <PageSkeleton cards={4} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const entries = pagedData?.content ?? [];

  const trendData = (analytics?.trendPoints ?? []).slice(-14).map((p) => ({
    date: format(parseISO(p.date), "MMM d"),
    cigarettesCount: p.cigarettesCount,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight">Smoking Tracker</h1>
          <p className="text-muted-foreground">
            Track and reduce cigarette consumption.
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
              <Plus className="h-4 w-4" /> Log Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit" : "New"} Smoking Log
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Smoke-free day?</Label>
                <Switch
                  checked={smokeFree}
                  onCheckedChange={(v) => {
                    form.setValue("smokeFree", v);
                    if (v) form.setValue("cigarettesCount", 0);
                  }}
                />
              </div>
              {!smokeFree && (
                <div className="space-y-2">
                  <Label>Cigarettes</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    {...form.register("cigarettesCount")}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Cravings (1-10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="1-10"
                  {...form.register("cravings")}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Triggers, context..."
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

      {/* Stats cards */}
      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Card className="shadow-md overflow-hidden min-w-0">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Flame className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Smoke-free streak
                </div>
                <div className="text-2xl font-bold">
                  {analytics.smokeFreeStreak} days
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md overflow-hidden min-w-0">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <TrendingDown className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Weekly avg</div>
                <div className="text-2xl font-bold">
                  {(analytics.weeklyAvgCigarettes ?? 0).toFixed(1)}
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
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="cigarettesCount"
                      fill="var(--color-cigarettesCount)"
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
          { label: "Cigarettes", value: "cigarettesCount" },
          { label: "Cravings", value: "cravings" },
        ]}
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSortByChange={setSortBy}
        onSortDirChange={setSortDir}
        onReset={reset}
      />

      {entries.length === 0 ? (
        <EmptyState
          title="No smoking logs"
          description="Start logging to track your progress."
          action={
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Log Entry
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
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${entry.smokeFree ? "bg-emerald-500/10" : "bg-rose-500/10"}`}
                  >
                    <Cigarette
                      className={`h-5 w-5 ${entry.smokeFree ? "text-emerald-500" : "text-rose-500"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {entry.smokeFree
                        ? "Smoke-free"
                        : `${entry.cigarettesCount} cigarettes`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(entry.date), "MMM d, yyyy")}
                    </div>
                  </div>
                  {entry.cravings > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs hidden sm:inline-flex"
                    >
                      Cravings: {entry.cravings}/10
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
