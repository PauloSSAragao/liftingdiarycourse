# Data Fetching Standards

## CRITICAL: Server Components Only

**All data fetching MUST be done exclusively via React Server Components.**

- Do NOT fetch data in client components (`"use client"`)
- Do NOT fetch data in route handlers (`app/api/` routes)
- Do NOT use `useEffect`, `fetch`, SWR, React Query, or any client-side fetching mechanism
- Do NOT expose database queries through API endpoints

Every piece of data the UI needs must be fetched at the server component level and passed down as props to any client components that need it.

## Database Queries: /data Folder

All database queries must live in helper functions inside the `/data` folder.

- One file per domain entity (e.g., `data/workouts.ts`, `data/exercises.ts`)
- Components must call these helper functions — never query the database directly from a page or component file
- Helper functions must use **Drizzle ORM** for all queries — **do NOT write raw SQL**

```ts
// ✅ Correct — use Drizzle ORM
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkouts(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```ts
// ❌ Wrong — raw SQL
const result = await db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);
```

## CRITICAL: User Data Isolation

**A logged-in user must ONLY ever be able to access their own data.**

Every query in `/data` that returns user-specific data MUST filter by the authenticated user's ID. Never fetch all rows and filter later in the UI — always filter at the query level.

```ts
// ✅ Correct — always scope queries to the current user
import { auth } from "@clerk/nextjs/server";

export async function getWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```ts
// ❌ Wrong — fetches all users' data
export async function getWorkouts() {
  return db.select().from(workouts);
}
```

Never accept a `userId` parameter from the caller — always derive it from `auth()` inside the helper function so the caller cannot request another user's data.

## Summary Checklist

| Rule | Required |
|------|----------|
| Fetch data only in server components | YES |
| Use `/data` helper functions for all DB access | YES |
| Use Drizzle ORM (no raw SQL) | YES |
| Scope every query to the authenticated user via `auth()` | YES |
| Fetch data in client components or route handlers | NO |
| Accept userId as a parameter from the caller | NO |
