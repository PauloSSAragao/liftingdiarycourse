# UI Coding Standards

## Component Library

**Only shadcn/ui components must be used for all UI in this project.**

Do not create custom components. Every UI element — buttons, inputs, dialogs, tables, cards, badges, etc. — must come from the shadcn/ui library. If a required component is not yet installed, add it via the CLI:

```bash
npx shadcn@latest add <component-name>
```

## Date Formatting

Use `date-fns` for all date formatting. Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2026
```

Use the `do MMM yyyy` format token with `date-fns/format`:

```ts
import { format } from "date-fns";

format(new Date("2025-09-01"), "do MMM yyyy"); // "1st Sep 2025"
format(new Date("2025-08-02"), "do MMM yyyy"); // "2nd Aug 2025"
```
