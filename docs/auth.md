# Authentication Standards

This app uses [Clerk](https://clerk.com) (`@clerk/nextjs`) as the sole authentication provider. Do not introduce any other authentication libraries or implement custom auth logic.

## Core Setup

- **Middleware**: `proxy.ts` runs `clerkMiddleware()` on all matched routes. By default, all routes are **public**. Use `createRouteMatcher` to protect specific routes.
- **Provider**: `<ClerkProvider>` wraps the entire app in `app/layout.tsx`. Do not add another provider or move it.

## Protecting Routes

Use `createRouteMatcher` inside `proxy.ts` to declare protected routes, then call `auth().protect()` for matched requests:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/workout(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

## Getting the Current User

### Server Components / Route Handlers / Server Actions

Use the async `auth()` helper from `@clerk/nextjs/server`. Never trust client-supplied user IDs — always derive the user from `auth()` on the server.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) {
  // handle unauthenticated state
}
```

### Client Components

Use the `useAuth()` or `useUser()` hooks from `@clerk/nextjs`.

```tsx
import { useAuth } from "@clerk/nextjs";

const { userId, isLoaded, isSignedIn } = useAuth();
```

## UI Components

Use Clerk's pre-built components for all auth-related UI. Do not build custom sign-in/sign-up forms.

| Component | Usage |
|---|---|
| `<SignedIn>` | Renders children only when a user is signed in |
| `<SignedOut>` | Renders children only when no user is signed in |
| `<SignInButton mode="modal">` | Triggers the Clerk sign-in flow |
| `<SignUpButton mode="modal">` | Triggers the Clerk sign-up flow |
| `<UserButton>` | Renders the user avatar with account management dropdown |

These are already placed in `app/layout.tsx` header and apply globally.

## Rules

- Always use `auth()` server-side to get `userId`. Never read a user ID from URL params, request bodies, or cookies manually.
- Never expose secret keys (`CLERK_SECRET_KEY`) to the client. Only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` belongs in client-accessible env vars.
- Do not conditionally render protected page content client-side as a security measure — enforce access at the middleware or server component level.
- Keep all Clerk component imports from `@clerk/nextjs` (client) or `@clerk/nextjs/server` (server). Do not mix them.
