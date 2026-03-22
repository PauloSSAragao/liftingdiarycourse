"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addExerciseToWorkoutAction } from "./actions";
import ExerciseCard from "./exercise-card";

export type SetRow = {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: string | null;
};

export type WorkoutExerciseWithSets = {
  workoutExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: SetRow[];
};

type Props = {
  workoutId: string;
  workoutExercises: WorkoutExerciseWithSets[];
  allExercises: { id: string; name: string }[];
};

export default function ExerciseList({
  workoutId,
  workoutExercises,
  allExercises,
}: Props) {
  const router = useRouter();
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAddExercise() {
    if (!selectedExerciseId) return;
    startTransition(async () => {
      await addExerciseToWorkoutAction(workoutId, selectedExerciseId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Exercises</h2>

      {workoutExercises.length === 0 ? (
        <p className="text-muted-foreground text-sm">No exercises yet.</p>
      ) : (
        workoutExercises.map((we) => (
          <ExerciseCard
            key={we.workoutExerciseId}
            workoutExerciseId={we.workoutExerciseId}
            exerciseName={we.exerciseName}
            sets={we.sets}
          />
        ))
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Exercise</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            disabled={isPending}
          >
            <option value="">Select an exercise...</option>
            {allExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <Button onClick={handleAddExercise} disabled={isPending || !selectedExerciseId}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
