# Data Mutations Standards

## CRITICAL: Server Actions Only

**All data mutations MUST be done exclusively via Next.js Server Actions.**

- Do NOT mutate data in route handlers (`app/api/` routes)
- Do NOT perform mutations directly from client components via `fetch`
- Do NOT use client-side state management or API calls for write operations

## Server Actions: Collocated `actions.ts` Files

Server actions must live in `actions.ts` files collocated with the route or feature they belong to.

```
app/
  dashboard/
    workouts/
      page.tsx
      actions.ts   ✅ server actions for this route
```

Every `actions.ts` file must begin with the `"use server"` directive.

```ts
"use server";
```

## Database Mutations: /data Folder

All database write operations must be wrapped in helper functions inside the `/data` folder — exactly as with reads.

- One file per domain entity (e.g., `data/workouts.ts`, `data/exercises.ts`)
- Server actions must call these helper functions — never call Drizzle directly from an `actions.ts` file
- Helper functions must use **Drizzle ORM** for all mutations — **do NOT write raw SQL**

```ts
// ✅ Correct — /data/workouts.ts wraps the Drizzle call
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date });
}
```

```ts
// ❌ Wrong — Drizzle called directly inside a server action
"use server";

export async function createWorkoutAction(name: string) {
  await db.insert(workouts).values({ name }); // never do this
}
```

## Typed Parameters — No FormData

Server action parameters must be **explicitly typed**. Do NOT use the `FormData` type.

```ts
// ✅ Correct — typed parameters
export async function createWorkoutAction(name: string, date: Date) { ... }
```

```ts
// ❌ Wrong — FormData parameter
export async function createWorkoutAction(formData: FormData) { ... }
```

Use controlled React state or form libraries to collect values and pass them as typed arguments to the server action.

## CRITICAL: Validate All Arguments with Zod

**Every server action MUST validate its arguments using Zod before doing anything else.**

Define a Zod schema at the top of the action and call `.parse()` (throws on invalid input) or `.safeParse()` (returns a result object). Never trust caller-supplied data.

```ts
// ✅ Correct — validate with Zod before any logic
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { auth } from "@clerk/nextjs/server";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
});

export async function createWorkoutAction(name: string, date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = CreateWorkoutSchema.parse({ name, date });

  await createWorkout(userId, validated.name, validated.date);
}
```

```ts
// ❌ Wrong — no validation, arguments used directly
export async function createWorkoutAction(name: string, date: Date) {
  await createWorkout(userId, name, date);
}
```

## CRITICAL: No Redirects Inside Server Actions

**Server actions must NOT call `redirect()` from `next/navigation`.** Redirects must be handled client-side after the server action resolves.

```ts
// ❌ Wrong — redirect inside a server action
"use server";
import { redirect } from "next/navigation";

export async function createWorkoutAction(name: string, date: string) {
  await createWorkout(userId, name, date);
  redirect("/dashboard"); // never do this
}
```

```ts
// ✅ Correct — server action returns, client handles redirect
"use server";

export async function createWorkoutAction(name: string, date: string) {
  await createWorkout(userId, name, date);
  // just return — no redirect
}
```

```tsx
// ✅ Correct — client component calls the action then redirects
"use client";
import { useRouter } from "next/navigation";

const router = useRouter();

async function handleSubmit() {
  await createWorkoutAction(name, date);
  router.push("/dashboard");
}
```

## CRITICAL: User Data Isolation

**Server actions must never mutate another user's data.**

Always derive the authenticated user's ID from `auth()` inside the server action. Never accept a `userId` as a parameter from the caller.

```ts
// ✅ Correct — userId sourced from auth()
const { userId } = await auth();
if (!userId) throw new Error("Unauthorized");
```

```ts
// ❌ Wrong — userId accepted from the caller
export async function deleteWorkoutAction(userId: string, workoutId: string) { ... }
```

When updating or deleting a specific record, always scope the query to both the record ID **and** the authenticated user's ID so a user cannot affect records they do not own.

```ts
// ✅ Correct — /data/workouts.ts scopes delete to the owner
export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Summary Checklist

| Rule | Required |
|------|----------|
| Mutations only via server actions | YES |
| Server actions in collocated `actions.ts` files | YES |
| `"use server"` directive at top of every `actions.ts` | YES |
| DB writes wrapped in `/data` helper functions (Drizzle ORM) | YES |
| All action params explicitly typed | YES |
| `FormData` as a parameter type | NO |
| Validate all params with Zod before any logic | YES |
| Derive `userId` from `auth()` — never accept it as a param | YES |
| Scope update/delete queries to the authenticated user | YES |
| Raw SQL or direct Drizzle calls inside `actions.ts` | NO |
| `redirect()` inside server actions | NO |
| Redirects handled client-side via `router.push()` after action resolves | YES |
