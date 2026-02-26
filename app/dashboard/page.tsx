import { getWorkoutsForDate } from "@/data/workouts";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const dateStr = date ?? new Date().toISOString().split("T")[0];
  const initialDate = new Date(`${dateStr}T00:00:00`);

  const workoutRows = await getWorkoutsForDate(dateStr);

  return <DashboardClient initialDate={initialDate} workoutRows={workoutRows} />;
}
