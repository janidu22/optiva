import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import {
  User,
  Save,
  Loader2,
  CalendarDays,
  Ruler,
  Weight,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { profileApi } from "@/api/endpoints";
import type { Gender } from "@/types";

const profileSchema = z.object({
  age: z.coerce.number().min(1).max(120).optional(),
  heightCm: z.coerce.number().min(50).max(300).optional(),
  startingWeightKg: z.coerce.number().min(20).max(500).optional(),
  targetWeightKg: z.coerce.number().min(20).max(500).optional(),
  timezone: z.string().optional(),
  gender: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const GENDERS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.get,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as never,
    values: profile
      ? {
          age: profile.age || undefined,
          heightCm: profile.heightCm || undefined,
          startingWeightKg: profile.startingWeightKg || undefined,
          targetWeightKg: profile.targetWeightKg || undefined,
          timezone:
            profile.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          gender: profile.gender || undefined,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormValues) =>
      profileApi.update({ ...data, gender: data.gender as Gender }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  function onSubmit(values: ProfileFormValues) {
    updateMutation.mutate(values);
  }

  if (isLoading) return <PageSkeleton cards={2} />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!profile) return null;

  const initials =
    `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View and update your personal information.
        </p>
      </div>

      {/* User info card */}
      <Card className="shadow-md overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold truncate">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                {profile.email}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {profile.gender && (
                  <Badge variant="secondary">{profile.gender}</Badge>
                )}
                {profile.createdAt && (
                  <Badge variant="outline" className="text-xs">
                    Joined {format(parseISO(profile.createdAt), "MMM yyyy")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Personal Details
          </CardTitle>
          <CardDescription>
            Update your health and personal metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                  Age
                </Label>
                <Input
                  type="number"
                  placeholder="30"
                  {...form.register("age")}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={form.watch("gender") || ""}
                  onValueChange={(v) => form.setValue("gender", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground" /> Height
                  (cm)
                </Label>
                <Input
                  type="number"
                  placeholder="175"
                  {...form.register("heightCm")}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                  Starting Weight (kg)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="80"
                  {...form.register("startingWeightKg")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                  Target Weight (kg)
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70"
                  {...form.register("targetWeightKg")}
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input
                  placeholder="Europe/London"
                  {...form.register("timezone")}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
