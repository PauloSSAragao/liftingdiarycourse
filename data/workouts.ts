import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
    .innerJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .innerJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)));
}
