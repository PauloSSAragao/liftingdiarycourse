"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import {
  updateWorkout,
  getWorkoutById,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet,
  removeSet,
  getWorkoutExercisesCount,
  getExerciseSetsCount,
} from "@/data/workouts";

// Zod v4 enforces strict RFC 9562 UUID (version [1-8], variant [89abAB]).
// We validate structure only since IDs come from our own Postgres database.
const dbId = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  );

const UpdateWorkoutSchema = z.object({
  workoutId: dbId,
  name: z.string().max(255).optional(),
  date: z.coerce.date(),
});

export async function updateWorkoutAction(
  workoutId: string,
  name: string,
  date: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = UpdateWorkoutSchema.parse({
    workoutId,
    name: name || undefined,
    date,
  });

  await updateWorkout(
    userId,
    validated.workoutId,
    validated.name ?? null,
    format(validated.date, "yyyy-MM-dd")
  );
}

const AddExerciseSchema = z.object({
  workoutId: dbId,
  exerciseId: dbId,
});

export async function addExerciseToWorkoutAction(
  workoutId: string,
  exerciseId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = AddExerciseSchema.parse({ workoutId, exerciseId });

  const workout = await getWorkoutById(validated.workoutId);
  if (!workout) throw new Error("Not found");

  const order =
    (await getWorkoutExercisesCount(validated.workoutId)) + 1;

  await addExerciseToWorkout(validated.workoutId, validated.exerciseId, order);
}

const RemoveExerciseSchema = z.object({
  workoutExerciseId: dbId,
});

export async function removeExerciseFromWorkoutAction(
  workoutExerciseId: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = RemoveExerciseSchema.parse({ workoutExerciseId });

  await removeExerciseFromWorkout(validated.workoutExerciseId, userId);
}

const AddSetSchema = z.object({
  workoutExerciseId: dbId,
  reps: z.number().int().min(1).max(999),
  weight: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export async function addSetAction(
  workoutExerciseId: string,
  reps: number,
  weight: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = AddSetSchema.parse({ workoutExerciseId, reps, weight });

  const setNumber =
    (await getExerciseSetsCount(validated.workoutExerciseId)) + 1;

  await addSet(
    validated.workoutExerciseId,
    setNumber,
    validated.reps,
    validated.weight
  );
}

const RemoveSetSchema = z.object({
  setId: dbId,
});

export async function removeSetAction(setId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = RemoveSetSchema.parse({ setId });

  await removeSet(validated.setId, userId);
}
