# CLAUDE.md Docs Sync Agent Memory

## Project: liftingdiarycourse

### CLAUDE.md Location
`C:\data\course\claude-code\webdev\liftingdiarycourse\CLAUDE.md`

### Docs Reference Section
Section header: `## IMPORTANT: Documentation First`
New entries are appended to the end of the bullet list in that section.

### Entry Format
`- /docs/filename.md - Brief description of what the file covers`
- No trailing period
- Noun-phrase style descriptions
- 5-15 words typical

### Known /docs Files (as of 2026-03-08)
- /docs/ui.md - UI component guidelines and patterns
- /docs/data-fetching.md - Data fetching rules, database query patterns, and user data isolation requirements
- /docs/data-mutations.md - Data mutation rules, server action conventions, Zod validation, and user data isolation requirements
- /docs/auth.md - Authentication standards and Clerk usage patterns
- /docs/server-components.md - Server component standards, including async params/searchParams (Next.js 15)
- /docs/routing.md - App Router route structure, route protection via middleware, and routing conventions

### Description Style Notes
- auth.md: ends with "usage patterns"
- data-fetching.md / data-mutations.md: lists key topics with "and" joining them
- server-components.md: uses "including" to call out specific sub-topics
- routing.md: uses "route X, Y, and Z conventions" pattern
