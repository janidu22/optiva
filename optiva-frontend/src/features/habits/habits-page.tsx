import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  Pencil,
  Target,
  Check,
  X,
  SkipForward,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { habitApi } from "@/api/endpoints";
import type { HabitResponse, HabitLogStatus } from "@/types";

const habitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type HabitFormValues = z.infer<typeof habitSchema>;

export default function HabitsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitResponse | null>(null);

  const {
    data: habits,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["habits"],
    queryFn: habitApi.getAll,
  });

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: { name: "", description: "" },
  });

  const createMutation = useMutation({
    mutationFn: (data: HabitFormValues) =>
      habitApi.create({ ...data, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habit created");
      closeDialog();
    },
    onError: () => toast.error("Failed to create habit"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: HabitFormValues }) =>
      habitApi.update(id, { ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habit updated");
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: habitApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Habit deleted");
    },
  });

  const logMutation = useMutation({
    mutationFn: ({
      habitId,
      status,
    }: {
      habitId: string;
      status: HabitLogStatus;
    }) =>
      habitApi.logHabit(habitId, {
        date: format(new Date(), "yyyy-MM-dd"),
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habit-analytics"] });
      toast.success("Habit logged");
    },
    onError: () => toast.error("Failed to log habit"),
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingHabit(null);
    form.reset({ name: "", description: "" });
  }

  function openEdit(habit: HabitResponse) {
    setEditingHabit(habit);
    form.reset({ name: habit.name, description: habit.description || "" });
    setDialogOpen(true);
  }

  function onSubmit(values: HabitFormValues) {
    if (editingHabit) {
      updateMutation.mutate({ id: editingHabit.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (isLoading) return <PageSkeleton cards={3} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const activeHabits = (habits ?? []).filter((h) => h.isActive);
  const inactiveHabits = (habits ?? []).filter((h) => !h.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            Build consistency with daily habits.
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
              <Plus className="h-4 w-4" /> New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHabit ? "Edit" : "New"} Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Morning run"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Optional details..."
                  {...form.register("description")}
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
                {editingHabit ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeHabits.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({inactiveHabits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {activeHabits.length === 0 ? (
            <EmptyState
              title="No active habits"
              description="Create your first habit to start tracking."
              action={
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> New Habit
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={() => openEdit(habit)}
                  onDelete={() => deleteMutation.mutate(habit.id)}
                  onLog={(status) =>
                    logMutation.mutate({ habitId: habit.id, status })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="mt-4">
          {inactiveHabits.length === 0 ? (
            <EmptyState
              title="No inactive habits"
              description="All your habits are active."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={() => openEdit(habit)}
                  onDelete={() => deleteMutation.mutate(habit.id)}
                  onLog={(status) =>
                    logMutation.mutate({ habitId: habit.id, status })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HabitCard({
  habit,
  onEdit,
  onDelete,
  onLog,
}: {
  habit: HabitResponse;
  onEdit: () => void;
  onDelete: () => void;
  onLog: (status: HabitLogStatus) => void;
}) {
  const { data: analytics } = useQuery({
    queryKey: ["habit-analytics", habit.id],
    queryFn: () => habitApi.getAnalytics(habit.id),
  });

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden min-w-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {habit.name}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {habit.description && (
          <p className="text-xs text-muted-foreground">{habit.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {analytics && (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Streak</span>
              <Badge variant="secondary">{analytics.currentStreak}d</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">7-day</span>
                <span>{analytics.adherence7Day}%</span>
              </div>
              <Progress value={analytics.adherence7Day} className="h-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">30-day</span>
                <span>{analytics.adherence30Day}%</span>
              </div>
              <Progress value={analytics.adherence30Day} className="h-1.5" />
            </div>
          </>
        )}
        <Separator />
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            size="sm"
            variant="default"
            className="gap-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onLog("DONE")}
          >
            <Check className="h-3 w-3" /> Done
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => onLog("SKIPPED")}
          >
            <SkipForward className="h-3 w-3" /> Skip
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-rose-500 border-rose-200 hover:bg-rose-50"
            onClick={() => onLog("MISSED")}
          >
            <X className="h-3 w-3" /> Missed
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
