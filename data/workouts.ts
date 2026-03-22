import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and, asc, count } from "drizzle-orm";
import { format } from "date-fns";

export async function createWorkout(userId: string, name: string | null, date: Date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return db.insert(workouts).values({ userId, name, date: dateStr });
}

export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const result = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  name: string | null,
  date: string
) {
  return db
    .update(workouts)
    .set({ name, date })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

export async function getWorkoutWithExercisesAndSets(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select({
      workoutExerciseId: workoutExercises.id,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(asc(workoutExercises.order), asc(sets.setNumber));
}

export async function addExerciseToWorkout(
  workoutId: string,
  exerciseId: string,
  order: number
) {
  return db.insert(workoutExercises).values({ workoutId, exerciseId, order });
}

export async function removeExerciseFromWorkout(
  workoutExerciseId: string,
  userId: string
) {
  const rows = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    )
    .limit(1);

  if (!rows[0]) throw new Error("Not found");

  return db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}

export async function addSet(
  workoutExerciseId: string,
  setNumber: number,
  reps: number,
  weight: string
) {
  return db.insert(sets).values({ workoutExerciseId, setNumber, reps, weight });
}

export async function removeSet(setId: string, userId: string) {
  const rows = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)))
    .limit(1);

  if (!rows[0]) throw new Error("Not found");

  return db.delete(sets).where(eq(sets.id, setId));
}

export async function getWorkoutExercisesCount(workoutId: string) {
  const result = await db
    .select({ value: count() })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));
  return result[0]?.value ?? 0;
}

export async function getExerciseSetsCount(workoutExerciseId: string) {
  const result = await db
    .select({ value: count() })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));
  return result[0]?.value ?? 0;
}

export async function getWorkoutsForDate(date: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      exerciseName: exercises.name,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
      workoutExerciseId: workoutExercises.id,
      order: workoutExercises.order,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)));
}
