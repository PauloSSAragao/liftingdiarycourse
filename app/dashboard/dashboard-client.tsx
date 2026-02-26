"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WorkoutRow = {
  workoutId: string;
  workoutName: string | null;
  exerciseName: string;
  workoutExerciseId: string;
  order: number;
  setNumber: number;
  reps: number | null;
  weight: string | null;
};

type GroupedExercise = {
  workoutExerciseId: string;
  exerciseName: string;
  sets: { setNumber: number; reps: number | null; weight: string | null }[];
};

function groupByExercise(rows: WorkoutRow[]): GroupedExercise[] {
  const map = new Map<string, GroupedExercise>();
  for (const row of rows) {
    if (!map.has(row.workoutExerciseId)) {
      map.set(row.workoutExerciseId, {
        workoutExerciseId: row.workoutExerciseId,
        exerciseName: row.exerciseName,
        sets: [],
      });
    }
    map.get(row.workoutExerciseId)!.sets.push({
      setNumber: row.setNumber,
      reps: row.reps,
      weight: row.weight,
    });
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

  const formattedDate = format(selectedDate, "do MMM yyyy");
  const exercises = groupByExercise(workoutRows);

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    setSelectedDate(date);
    const dateStr = format(date, "yyyy-MM-dd");
    router.push(`/dashboard?date=${dateStr}`);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
            />
          </CardContent>
        </Card>

        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-semibold">
            Workouts for <span className="text-primary">{formattedDate}</span>
          </h2>

          {exercises.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No workouts logged for this date.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise) => (
                <Card key={exercise.workoutExerciseId}>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
