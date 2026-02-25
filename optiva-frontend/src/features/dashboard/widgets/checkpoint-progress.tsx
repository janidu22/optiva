import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, differenceInDays, isAfter } from "date-fns";
import type { ProgramResponse } from "@/types";

interface Props {
  programs: ProgramResponse[];
}

export function CheckpointProgress({ programs }: Props) {
  const program = programs[0];
  const now = new Date();

  if (!program || !program.checkpoints?.length) {
    return (
      <Card className="shadow-md overflow-hidden min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Checkpoint Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active program.</p>
        </CardContent>
      </Card>
    );
  }

  const totalCheckpoints = program.checkpoints.length;
  const achieved = program.checkpoints.filter(
    (c) => c.status === "ACHIEVED",
  ).length;
  const pct = Math.round((achieved / totalCheckpoints) * 100);
  const nextCheckpoint = program.checkpoints
    .filter(
      (c) =>
        c.status === "UPCOMING" && isAfter(parseISO(c.checkpointDate), now),
    )
    .sort(
      (a, b) =>
        new Date(a.checkpointDate).getTime() -
        new Date(b.checkpointDate).getTime(),
    )[0];

  const daysToNext = nextCheckpoint
    ? differenceInDays(parseISO(nextCheckpoint.checkpointDate), now)
    : null;

  return (
    <Card className="shadow-md overflow-hidden min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Checkpoint Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {achieved} / {totalCheckpoints} achieved
          </span>
          <span className="font-semibold">{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
        {nextCheckpoint && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Next:{" "}
              {format(parseISO(nextCheckpoint.checkpointDate), "MMM d, yyyy")}
            </span>
            <Badge variant="secondary" className="text-xs">
              {daysToNext}d left
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
