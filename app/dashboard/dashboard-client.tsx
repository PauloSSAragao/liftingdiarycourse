"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type WorkoutRow = {
  workoutId: string;
  workoutName: string | null;
  exerciseName: string | null;
  workoutExerciseId: string | null;
  order: number | null;
  setNumber: number | null;
  reps: number | null;
  weight: string | null;
};

type GroupedExercise = {
  workoutExerciseId: string;
  workoutId: string;
  exerciseName: string;
  sets: { setNumber: number; reps: number | null; weight: string | null }[];
};

function groupByExercise(rows: WorkoutRow[]): GroupedExercise[] {
  const map = new Map<string, GroupedExercise>();
  for (const row of rows) {
    if (!row.workoutExerciseId) continue;
    if (!map.has(row.workoutExerciseId)) {
      map.set(row.workoutExerciseId, {
        workoutExerciseId: row.workoutExerciseId,
        workoutId: row.workoutId,
        exerciseName: row.exerciseName!,
        sets: [],
      });
    }
    if (row.setNumber !== null) {
      map.get(row.workoutExerciseId)!.sets.push({
        setNumber: row.setNumber,
        reps: row.reps,
        weight: row.weight,
      });
    }
  }
  return Array.from(map.values());
}

export default function DashboardClient({
  initialDate,
  workoutRows,
}: {
  initialDate: Date;
  workoutRows: WorkoutRow[];
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [open, setOpen] = useState(false);

  const formattedDate = format(selectedDate, "do MMM yyyy");
  const exercises = groupByExercise(workoutRows);

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    setSelectedDate(date);
    setOpen(false);
    const dateStr = format(date, "yyyy-MM-dd");
    router.push(`/dashboard?date=${dateStr}`);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/dashboard/workout/new">Log New Workout</Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formattedDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
          <h2 className="text-xl font-semibold">
            Workouts for <span className="text-primary">{formattedDate}</span>
          </h2>
        </div>

        <div className="space-y-4">

          {workoutRows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No workouts logged for this date.
              </CardContent>
            </Card>
          ) : exercises.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Workout logged — no exercises added yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <Link
                  key={exercise.workoutExerciseId}
                  href={`/dashboard/workout/${exercise.workoutId}`}
                >
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-lg">
                          {exercise.exerciseName}
                        </p>
                        <Badge variant="secondary">
                          {exercise.sets.length}{" "}
                          {exercise.sets.length === 1 ? "set" : "sets"}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        {exercise.sets.map((set) => (
                          <p
                            key={set.setNumber}
                            className="text-sm text-muted-foreground"
                          >
                            Set {set.setNumber}: {set.reps ?? "—"} reps
                            {set.weight ? ` × ${set.weight} kg` : ""}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
