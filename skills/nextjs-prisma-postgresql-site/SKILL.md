---
name: nextjs-prisma-postgresql-site
description: "Next.js + Prisma PostgreSQL site."
version: 1.0
author: user
---

# Next.js + Prisma + PostgreSQL Site

Use when building a production Next.js site with App Router, Prisma ORM, PostgreSQL, JWT auth, and premium dark design.

Procedure: read spec → check deps → set PostgreSQL schema → types → data files → auth library → middleware → pages → seed.

Pitfalls: don't replace PostgreSQL with SQLite; SQLite has no enums/arrays; pages with `onSubmit` need `'use client'` but lose `metadata`; fix import paths (`getServices` from `data/services`); `winget` PostgreSQL may 403 — download `.exe` directly.
