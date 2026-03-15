"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { updateWorkout } from "@/data/workouts";

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
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
