# Routing Standards

This app uses the Next.js App Router. All application routes live under `/dashboard`.

## Route Structure

- `/` — Public landing page (`app/page.tsx`)
- `/dashboard` — Main dashboard, protected (`app/dashboard/page.tsx`)
- `/dashboard/workout/new` — Create workout, protected (`app/dashboard/workout/new/page.tsx`)
- `/dashboard/workout/[workoutId]` — Edit workout, protected (`app/dashboard/workout/[workoutId]/page.tsx`)

All new pages must be added under `app/dashboard/` and will be automatically protected by middleware.

## Route Protection

Route protection is handled exclusively in `proxy.ts` via Clerk middleware. Do not implement access control in page components or layouts.

Use `createRouteMatcher` to protect all `/dashboard` routes:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

- `/dashboard(.*)` covers `/dashboard` and all sub-routes.
- Unauthenticated users are automatically redirected to Clerk's sign-in page.
- Do not add `auth().protect()` calls inside page components — middleware handles it.

## Rules

- All authenticated app pages must live under `/dashboard`.
- Never rely on client-side conditional rendering to protect routes — middleware is the enforcement point.
- Dynamic segments use the `[paramName]` folder convention (e.g., `[workoutId]`).
- Co-locate page-specific server actions, client components, and forms in the same route folder (e.g., `actions.ts`, `workout-form.tsx` alongside `page.tsx`).
- Do not create routes outside `/dashboard` for authenticated features.
