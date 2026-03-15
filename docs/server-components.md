# Server Components Standards

## Page Props: Always Await `params` and `searchParams`

This project uses **Next.js 15**, where `params` and `searchParams` are **Promises** and must be awaited before accessing their values.

```tsx
// ✅ Correct — await params before use
type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  // ...
}
```

```tsx
// ❌ Wrong — accessing params synchronously
type Props = {
  params: { workoutId: string };
};

export default function EditWorkoutPage({ params }: Props) {
  const { workoutId } = params; // runtime error in Next.js 15
}
```

The same rule applies to `searchParams`:

```tsx
// ✅ Correct — await searchParams before use
type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { date } = await searchParams;
  // ...
}
```

## Server Components Must Be Async

All server components that fetch data or access `params`/`searchParams` must be declared `async`.

```tsx
// ✅ Correct
export default async function WorkoutPage({ params }: Props) { ... }

// ❌ Wrong — cannot use await in a non-async component
export default function WorkoutPage({ params }: Props) { ... }
```

## Not Found Handling

Use `notFound()` from `next/navigation` when a resource does not exist or does not belong to the authenticated user. Never render a partially valid page or leak information about records that don't belong to the user.

```tsx
import { notFound } from "next/navigation";

const workout = await getWorkoutById(workoutId);
if (!workout) {
  notFound();
}
```

## Summary Checklist

| Rule | Required |
|------|----------|
| Type `params` and `searchParams` as `Promise<...>` | YES |
| Await `params` and `searchParams` before accessing fields | YES |
| Declare data-fetching server components as `async` | YES |
| Call `notFound()` when a resource is missing or unauthorized | YES |
| Access `params` synchronously without awaiting | NO |
