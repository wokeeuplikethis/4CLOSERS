---
name: nextjs-prisma-postgresql-site
description: "Next.js + Prisma PostgreSQL site."
version: 1.0
author: user
---

# Next.js + Prisma + PostgreSQL Site

Use when building production web apps: Next.js 14 App Router, TypeScript, Tailwind, Prisma, PostgreSQL, JWT auth.

## Procedure

1. Read spec (`тз 1.txt`) first.
2. Check dependencies (`prisma`, `jose`, `bcryptjs`, `lucide-react`).
3. Set PostgreSQL schema (`provider = "postgresql"`).
4. Build types (`StudioConfig`, `Service`, etc.).
5. Create data (`Record<'moscow'|'spb', ...>`).
6. Auth: `jose` + `bcryptjs`, cookie session, middleware.
7. Pages: `'use client'` only for `onSubmit`; remove `metadata` from client pages.
8. Seed with `hashPassword` and demo admin (`admin123`).
9. Fix build errors: `Client Component props` → add `'use client'`.

## Pitfalls

- Do NOT replace PostgreSQL with SQLite — user requires PostgreSQL.
- SQLite doesn't support enums/arrays; revert to PostgreSQL enums (`String[]`, `BookingStatus`).
- Pages with `onSubmit` need `'use client'` but can't export `metadata`.
- `winget` PostgreSQL download may fail with 403; use EnterpriseDB `.exe` directly.
