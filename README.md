## Mini Task Management Board

This repository contains the take-home scaffold for a mini task management
board. The current step establishes the Supabase foundation only: typed env
handling, database schema, seed data, and a safe browser client that does not
crash when backend credentials are missing.

## Getting Started

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. In Supabase SQL Editor, run [supabase/schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql).
4. Then run [supabase/seed.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.sql).

If those env vars are missing, the app stays bootable and renders a setup-state
message instead of throwing at import time.

## Demo Policy Note

The SQL schema includes demo-only anonymous policies for `select`, `insert`,
and `update` on `public.tasks`. These are intentionally permissive for the
take-home simulation and are not suitable for production without real auth and
tighter authorization rules.

## Validation

Run the baseline checks after major changes:

```bash
npm run lint
npm run typecheck
npm run build
```
