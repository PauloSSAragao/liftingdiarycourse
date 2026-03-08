"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().max(255).optional(),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = CreateWorkoutSchema.parse({ name: name || undefined, date });

  await createWorkout(userId, validated.name ?? null, validated.date);

  redirect(`/dashboard?date=${format(validated.date, "yyyy-MM-dd")}`);
}
