# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Documentation First

Before generating any code, Claude Code MUST always consult the relevant documentation files in the `/docs` folder. These files define the project's conventions, patterns, and requirements that all generated code must follow. Do not write code that contradicts or ignores guidance found in `/docs`:
- /docs/ui.md - UI component guidelines and patterns
- /docs/data-fetching.md - Data fetching rules, database query patterns, and user data isolation requirements

## Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint (uses flat config with Next.js core-web-vitals and TypeScript rules)

## Architecture

This is a Next.js 16 project using the App Router pattern with TypeScript and Tailwind CSS 4.

### Key Technologies
- **Next.js 16** with App Router (all routes in `app/` directory)
- **React 19**
- **Tailwind CSS 4** - uses `@import "tailwindcss"` syntax and `@theme inline` for CSS variables
- **TypeScript** with strict mode enabled
- **Clerk** - Authentication via `@clerk/nextjs`

### Project Structure
- `app/` - App Router pages and layouts
  - `layout.tsx` - Root layout with ClerkProvider and Geist font configuration
  - `page.tsx` - Home page
  - `globals.css` - Global styles with Tailwind and CSS custom properties
- `proxy.ts` - Clerk middleware using `clerkMiddleware()` from `@clerk/nextjs/server`
- `public/` - Static assets

### Authentication
Clerk handles authentication. Key points:
- `clerkMiddleware()` in `proxy.ts` - by default all routes are public; use `createRouteMatcher` to protect specific routes
- `<ClerkProvider>` wraps the app in `layout.tsx`
- Use `<SignedIn>`, `<SignedOut>`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>` for UI
- Use `auth()` from `@clerk/nextjs/server` (async) to get auth state in server components

### Path Aliases
- `@/*` maps to project root (configured in tsconfig.json)
