"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mockWorkouts = [
  {
    id: 1,
    name: "Bench Press",
    sets: 4,
    reps: 8,
    weight: 100,
    date: new Date(),
  },
  {
    id: 2,
    name: "Squat",
    sets: 3,
    reps: 5,
    weight: 140,
    date: new Date(),
  },
  {
    id: 3,
    name: "Deadlift",
    sets: 3,
    reps: 3,
    weight: 180,
    date: new Date(),
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formattedDate = format(selectedDate, "do MMM yyyy");

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
            />
          </CardContent>
        </Card>

        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-semibold">
            Workouts for <span className="text-primary">{formattedDate}</span>
          </h2>

          {mockWorkouts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No workouts logged for this date.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {mockWorkouts.map((workout) => (
                <Card key={workout.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-lg">{workout.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {workout.sets} sets × {workout.reps} reps
                      </p>
                    </div>
                    <Badge variant="secondary">{workout.weight} kg</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
