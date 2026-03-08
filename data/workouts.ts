import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";

export async function createWorkout(userId: string, name: string | null, date: Date) {
  const dateStr = format(date, "yyyy-MM-dd");
  return db.insert(workouts).values({ userId, name, date: dateStr });
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
