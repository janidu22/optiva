import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, Pencil, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { DataPagination } from "@/components/shared/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { journalApi } from "@/api/endpoints";
import type { JournalEntryResponse } from "@/types";

const journalSchema = z.object({
  date: z.string().min(1),
  notes: z.string().optional(),
  ateNotes: z.string().optional(),
  tags: z.string().optional(),
  mood: z.coerce.number().min(1).max(10).optional(),
  energy: z.coerce.number().min(1).max(10).optional(),
  sleepHours: z.coerce.number().min(0).max(24).optional(),
  stress: z.coerce.number().min(1).max(10).optional(),
  emotions: z.string().optional(),
});

type JournalFormValues = z.infer<typeof journalSchema>;

export default function JournalPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntryResponse | null>(
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
    setSearch,
    reset,
  } = usePagination({ defaultSortBy: "entryDate" });

  const {
    data: pagedData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["journal-paged", params],
    queryFn: () => journalApi.getAllPaged(params),
  });

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema) as never,
    defaultValues: { date: format(new Date(), "yyyy-MM-dd") },
  });

  const createMutation = useMutation({
    mutationFn: journalApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-paged"] });
      toast.success("Journal entry saved");
      closeDialog();
    },
    onError: () => toast.error("Failed to save entry"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: JournalFormValues }) =>
      journalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-paged"] });
      toast.success("Entry updated");
      closeDialog();
    },
    onError: () => toast.error("Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: journalApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-paged"] });
      toast.success("Entry deleted");
    },
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingEntry(null);
    form.reset({ date: format(new Date(), "yyyy-MM-dd") });
  }

  function openEdit(entry: JournalEntryResponse) {
    setEditingEntry(entry);
    form.reset({
      date: entry.date,
      notes: entry.notes || "",
      ateNotes: entry.ateNotes || "",
      tags: entry.tags || "",
      mood: entry.mood || undefined,
      energy: entry.energy || undefined,
      sleepHours: entry.sleepHours || undefined,
      stress: entry.stress || undefined,
      emotions: entry.emotions || "",
    });
    setDialogOpen(true);
  }

  function onSubmit(values: JournalFormValues) {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (isLoading) return <PageSkeleton cards={3} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const entries = pagedData?.content ?? [];

  const moodEmoji = (mood: number) => {
    if (mood >= 8) return "😊";
    if (mood >= 6) return "🙂";
    if (mood >= 4) return "😐";
    if (mood >= 2) return "😟";
    return "😢";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight">Daily Journal</h1>
          <p className="text-muted-foreground">
            Reflect on your day, mood, and energy.
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
              <Plus className="h-4 w-4" /> New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? "Edit" : "New"} Journal Entry
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Mood (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="1-10"
                    {...form.register("mood")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Energy (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="1-10"
                    {...form.register("energy")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Sleep (hours)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min={0}
                    max={24}
                    placeholder="e.g. 7.5"
                    {...form.register("sleepHours")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stress (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="1-10"
                    {...form.register("stress")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  placeholder="How was your day?"
                  {...form.register("notes")}
                />
              </div>
              <div className="space-y-2">
                <Label>What I ate</Label>
                <Textarea
                  rows={2}
                  placeholder="Meals & snacks..."
                  {...form.register("ateNotes")}
                />
              </div>
              <div className="space-y-2">
                <Label>Emotions</Label>
                <Input
                  placeholder="e.g. grateful, anxious..."
                  {...form.register("emotions")}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="e.g. productive, rest-day"
                  {...form.register("tags")}
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

      {/* Toolbar */}
      <DataToolbar
        showSearch
        searchValue={params.search ?? ""}
        onSearchChange={setSearch}
        searchPlaceholder="Search notes, tags, emotions..."
        showDateRange
        dateFrom={params.dateFrom ?? ""}
        dateTo={params.dateTo ?? ""}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        showSort
        sortOptions={[
          { label: "Date", value: "entryDate" },
          { label: "Mood", value: "mood" },
          { label: "Energy", value: "energy" },
          { label: "Sleep", value: "sleepHours" },
        ]}
        sortBy={params.sortBy}
        sortDir={params.sortDir}
        onSortByChange={setSortBy}
        onSortDirChange={setSortDir}
        onReset={reset}
      />

      {entries.length === 0 ? (
        <EmptyState
          title="No journal entries"
          description="Start journaling to track your mood and reflections."
          action={
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> New Entry
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 min-w-0">
                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">
                      {format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}
                    </span>
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(entry)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteMutation.mutate(entry.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {entry.mood > 0 && (
                    <Badge variant="secondary">
                      {moodEmoji(entry.mood)} Mood: {entry.mood}/10
                    </Badge>
                  )}
                  {entry.energy > 0 && (
                    <Badge variant="secondary">
                      ⚡ Energy: {entry.energy}/10
                    </Badge>
                  )}
                  {entry.sleepHours > 0 && (
                    <Badge variant="secondary">
                      😴 {entry.sleepHours}h sleep
                    </Badge>
                  )}
                  {entry.stress > 0 && (
                    <Badge variant="secondary">
                      🧠 Stress: {entry.stress}/10
                    </Badge>
                  )}
                </div>
                {entry.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {entry.notes}
                  </p>
                )}
                {entry.tags && (
                  <div className="flex gap-1 flex-wrap">
                    {entry.tags.split(",").map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
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
