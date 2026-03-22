"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addSetAction, removeSetAction, removeExerciseFromWorkoutAction } from "./actions";
import type { SetRow } from "./exercise-list";

type Props = {
  workoutExerciseId: string;
  exerciseName: string;
  sets: SetRow[];
};

export default function ExerciseCard({
  workoutExerciseId,
  exerciseName,
  sets,
}: Props) {
  const router = useRouter();
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAddSet(e: React.FormEvent) {
    e.preventDefault();
    const repsNum = parseInt(reps, 10);
    if (!repsNum || !weight) return;
    startTransition(async () => {
      await addSetAction(workoutExerciseId, repsNum, weight);
      setReps("");
      setWeight("");
      router.refresh();
    });
  }

  function handleRemoveSet(setId: string) {
    startTransition(async () => {
      await removeSetAction(setId);
      router.refresh();
    });
  }

  function handleRemoveExercise() {
    startTransition(async () => {
      await removeExerciseFromWorkoutAction(workoutExerciseId);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{exerciseName}</CardTitle>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemoveExercise}
          disabled={isPending}
        >
          Remove Exercise
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {sets.length === 0 ? (
          <p className="text-muted-foreground text-sm">No sets yet.</p>
        ) : (
          <ul className="space-y-1">
            {sets.map((set) => (
              <li key={set.id} className="flex items-center justify-between text-sm">
                <span>
                  Set {set.setNumber}: {set.reps ?? "—"} reps ×{" "}
                  {set.weight ?? "—"} kg
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSet(set.id)}
                  disabled={isPending}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAddSet} className="flex gap-2 pt-2">
          <Input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            min={1}
            max={999}
            disabled={isPending}
            className="w-24"
          />
          <Input
            type="text"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={isPending}
            className="w-32"
          />
          <Button type="submit" size="sm" disabled={isPending || !reps || !weight}>
            {isPending ? "Adding..." : "Add Set"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
