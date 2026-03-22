import { notFound } from "next/navigation";
import { getWorkoutById, getWorkoutWithExercisesAndSets } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import WorkoutEditForm from "./workout-edit-form";
import ExerciseList from "./exercise-list";
import type { WorkoutExerciseWithSets, SetRow } from "./exercise-list";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;

  const [workout, workoutRows, allExercises] = await Promise.all([
    getWorkoutById(workoutId),
    getWorkoutWithExercisesAndSets(workoutId),
    getAllExercises(),
  ]);

  if (!workout) {
    notFound();
  }

  // Group flat rows into WorkoutExerciseWithSets[]
  const grouped: WorkoutExerciseWithSets[] = [];
  const seen = new Map<string, WorkoutExerciseWithSets>();

  for (const row of workoutRows) {
    if (!row.workoutExerciseId || !row.exerciseId || !row.exerciseName) continue;

    let entry = seen.get(row.workoutExerciseId);
    if (!entry) {
      entry = {
        workoutExerciseId: row.workoutExerciseId,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName,
        order: row.exerciseOrder ?? 0,
        sets: [],
      };
      seen.set(row.workoutExerciseId, entry);
      grouped.push(entry);
    }

    if (row.setId) {
      const set: SetRow = {
        id: row.setId,
        setNumber: row.setNumber ?? 0,
        reps: row.reps ?? null,
        weight: row.weight ?? null,
      };
      entry.sets.push(set);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <WorkoutEditForm
        workoutId={workout.id}
        initialName={workout.name ?? null}
        initialDate={workout.date}
      />
      <ExerciseList
        workoutId={workoutId}
        workoutExercises={grouped}
        allExercises={allExercises}
      />
    </div>
  );
}
