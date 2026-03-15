import { notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import WorkoutEditForm from "./workout-edit-form";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId);

  if (!workout) {
    notFound();
  }

  return (
    <WorkoutEditForm
      workoutId={workout.id}
      initialName={workout.name ?? null}
      initialDate={workout.date}
    />
  );
}
