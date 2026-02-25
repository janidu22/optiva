import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, Pencil, Scale, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { DataPagination } from "@/components/shared/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { weightApi } from "@/api/endpoints";
import type { WeightEntryResponse } from "@/types";

const weightSchema = z.object({
  date: z.string().min(1, "Date is required"),
  weightKg: z.coerce.number().positive("Weight must be positive"),
  notes: z.string().optional(),
});

type WeightFormValues = z.infer<typeof weightSchema>;

export default function WeightPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeightEntryResponse | null>(
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
  } = usePagination({ defaultSortBy: "entryDate" });

  const {
    data: pagedData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["weight-paged", params],
    queryFn: () => weightApi.getAllPaged(params),
  });

  const { data: stats } = useQuery({
    queryKey: ["weight-stats"],
    queryFn: weightApi.getStats,
  });

  const form = useForm<WeightFormValues>({
    resolver: zodResolver(weightSchema) as never,
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      weightKg: undefined,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: WeightFormValues) =>
      weightApi.create({
        date: data.date,
        weightKg: data.weightKg,
        notes: data.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weight-paged"] });
      queryClient.invalidateQueries({ queryKey: ["weight-stats"] });
      toast.success("Weight entry added");
      closeDialog();
    },
    onError: () => toast.error("Failed to add entry"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: WeightFormValues }) =>
      weightApi.update(id, {
        date: data.date,
        weightKg: data.weightKg,
        notes: data.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weight-paged"] });
      queryClient.invalidateQueries({ queryKey: ["weight-stats"] });
      toast.success("Weight entry updated");
      closeDialog();
    },
    onError: () => toast.error("Failed to update entry"),
  });

  const deleteMutation = useMutation({
    mutationFn: weightApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weight-paged"] });
      queryClient.invalidateQueries({ queryKey: ["weight-stats"] });
      toast.success("Entry deleted");
    },
    onError: () => toast.error("Failed to delete entry"),
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingEntry(null);
    form.reset({
      date: format(new Date(), "yyyy-MM-dd"),
      weightKg: undefined,
      notes: "",
    });
  }

  function openEdit(entry: WeightEntryResponse) {
    setEditingEntry(entry);
    form.reset({
      date: entry.date,
      weightKg: entry.weightKg,
      notes: entry.notes || "",
    });
    setDialogOpen(true);
  }

  function onSubmit(values: WeightFormValues) {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (isLoading) return <PageSkeleton cards={4} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const entries = pagedData?.content ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight">Weight Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your weight over time.
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
              <Plus className="h-4 w-4" /> Log Weight
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit" : "New"} Weight Entry
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 70.5"
                  {...form.register("weightKg")}
                />
                {form.formState.errors.weightKg && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.weightKg.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Optional notes..."
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
      {stats && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="shadow-md overflow-hidden min-w-0">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Current</div>
              <div className="text-2xl font-bold">{stats.currentWeight} kg</div>
            </CardContent>
          </Card>
          <Card className="shadow-md overflow-hidden min-w-0">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Starting</div>
              <div className="text-2xl font-bold">
                {stats.startingWeight} kg
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md overflow-hidden min-w-0">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Total Change</div>
              <div
                className={`text-2xl font-bold ${(stats.totalChange ?? 0) <= 0 ? "text-emerald-500" : "text-rose-500"}`}
              >
                {(stats.totalChange ?? 0) > 0 ? "+" : ""}
                {(stats.totalChange ?? 0).toFixed(1)} kg
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md overflow-hidden min-w-0">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">7-Day Avg</div>
              <div className="text-2xl font-bold">
                {stats.rollingAvg7Day?.toFixed(1) ?? "—"} kg
              </div>
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
          { label: "Date", value: "entryDate" },
          { label: "Weight", value: "weightKg" },
        ]}
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSortByChange={setSortBy}
        onSortDirChange={setSortDir}
        onReset={reset}
      />

      {/* Entries list */}
      {entries.length === 0 ? (
        <EmptyState
          title="No weight entries"
          description="Log your first weight to start tracking."
          action={
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Log Weight
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold">{entry.weightKg} kg</div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(entry.date), "MMM d, yyyy")}
                    </div>
                  </div>
                  {entry.notes && (
                    <Badge
                      variant="outline"
                      className="text-xs hidden sm:inline-flex max-w-[120px] truncate"
                    >
                      {entry.notes}
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
                    className="h-8 w-8 text-destructive hover:text-destructive"
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
