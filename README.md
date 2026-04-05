# Mini Task Management Board

A take-home implementation of a collaborative task board with:

- 3 columns: `todo`, `in_progress`, `done`
- create and edit flows
- drag-and-drop reorder and cross-column moves
- Supabase persistence and realtime sync
- optimistic UI for mutations
- simulated multi-user switching without authentication

## Architecture Overview

The app uses a strict split between UI state and server state.

- `Next.js App Router` provides the shell and client/server boundaries.
- `TanStack Query` owns server state only:
  task fetching, mutations, optimistic cache updates, rollback, reconciliation,
  and invalidation.
- `Zustand` owns UI state only:
  simulated active user, task form open/close state, and `editingTaskId`.
- `Supabase` owns persistence and realtime delivery.
- `dnd-kit` handles drag-and-drop interactions.

The main design goal was to keep the vertical slice easy to explain in a
take-home review rather than overbuilding abstractions.

## Folder Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    providers.tsx
  components/
    board/
      ...
  features/
    tasks/
      api/
      hooks/
      lib/
      types/
      query-keys.ts
  lib/
    supabase/
  store/
  types/
supabase/
  config.toml
  migrations/
  schema.sql
  seed.sql
docs/
  demo-script.md
  release-checklist.md
```

Structure rules:

- `features/tasks/api`: Supabase request functions
- `features/tasks/hooks`: query, mutation, and realtime hooks
- `features/tasks/lib`: pure helpers for ordering, cache updates, drag projection
- `components/board`: presentation and interaction components
- `store`: Zustand UI-only state

## State Boundaries

### Why Zustand For UI State Only

Zustand is used only for transient interface concerns:

- active simulated user
- whether the task form is open
- which task is being edited

Those values are local to the browser session and do not represent canonical
backend data. Keeping them in Zustand prevents accidental duplication of server
records.

### Why TanStack Query For Server State Only

TanStack Query owns the task list because it handles:

- loading and caching
- optimistic updates
- rollback on mutation failure
- server reconciliation after mutation success
- targeted invalidation when realtime patching is not safe

This keeps Supabase-backed task data in one place instead of mirroring it into
Zustand or component-local copies.

## Supabase Data Model

The project uses a single `tasks` table:

```sql
id uuid primary key
title text not null
description text not null default ''
status text check in ('todo', 'in_progress', 'done')
position double precision not null
updated_by text not null
created_at timestamptz not null
updated_at timestamptz not null
```

Supporting files:

- [supabase/migrations/20260405101702_create_tasks_table.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405101702_create_tasks_table.sql)
- [supabase/schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql)
- [supabase/seed.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.sql)

The schema includes demo-only anon policies for `select`, `insert`, and
`update`. That is acceptable for this take-home but should not be treated as a
production auth model.

## Supabase CLI Migration Setup

The repo is now set up for Supabase CLI migrations.

Files:

- [supabase/config.toml](/Users/mac/Desktop/mini-task-management-board/supabase/config.toml)
- [supabase/migrations/20260405101702_create_tasks_table.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405101702_create_tasks_table.sql)
- [supabase/seed.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.sql)

Useful scripts:

```bash
npm run db:start
npm run db:stop
npm run db:status
npm run db:reset
npm run db:push
```

Notes:

- `db:reset` applies migrations and then runs `supabase/seed.sql`
- `db:push` pushes local migrations to a linked remote Supabase project
- `db:start` requires Docker because the Supabase CLI runs the local stack in
  containers

## Realtime Implementation Approach

Realtime is wired through a single hook:

- [use-tasks-realtime-sync.ts](/Users/mac/Desktop/mini-task-management-board/src/features/tasks/hooks/use-tasks-realtime-sync.ts)

Behavior:

- subscribes once from the board shell
- listens to `INSERT` and `UPDATE` on `public.tasks`
- maps the incoming row into the app `Task` type
- patches the TanStack Query cache directly when the tasks list is already in
  cache
- falls back to invalidation when the list is not ready

Trade-off:

- this is intentionally lightweight
- there is no heavy conflict resolution layer
- the server remains the source of truth

## Ordering Strategy With `position`

Persisted order is based on the numeric `position` field, not array index.

Rules:

- new tasks go to the end of the chosen column
- drag-and-drop computes the new position from neighbors
- inserts and reorders use midpoint spacing
- canonical task ordering sorts by `position` within each status column

This keeps order persistence stable and easy to explain:

- no index-as-truth coupling
- no full-column rewrites for common moves
- rebalance logic is intentionally not added yet because it is not necessary for
  the current take-home slice

## Optimistic UI Approach

Create, edit, and move mutations all use `onMutate` to update the query cache
before the network round-trip completes.

Pattern:

1. cancel the in-flight tasks query
2. snapshot previous cached tasks
3. write an optimistic task change into the query cache
4. rollback to the snapshot on error
5. reconcile with the server response on success
6. invalidate on settle to keep the cache aligned with Supabase

This gives fast feedback without moving server state into Zustand.

## Setup Steps

### Option A: Supabase Dashboard Only

1. Install dependencies.
2. Create a Supabase project.
3. Copy `.env.example` to `.env.local`.
4. Add the public Supabase URL and anon key.
5. Run [schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql).
6. Run [seed.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.sql).
7. Start the app locally.

### Option B: Supabase CLI Migration Workflow

1. Install dependencies.
2. Install Docker if you want the full local Supabase stack.
3. Copy `.env.example` to `.env.local`.
4. Add the public Supabase URL and anon key.
5. Start the local Supabase stack:

```bash
npm run db:start
```

6. Apply migrations and seed local data:

```bash
npm run db:reset
```

7. Start the app:

```bash
npm run dev
```

### Push Migrations To A Remote Supabase Project

Authenticate the Supabase CLI first:

```bash
npx supabase login
```

Link the repo to your remote project:

```bash
npx supabase link --project-ref <your-project-ref>
```

Then push the migrations:

```bash
npm run db:push
```

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Env handling notes:

- env parsing is validated in `src/lib/supabase/env.ts`
- invalid or missing values do not crash the app at import time
- the UI shows setup messaging instead of throwing

## Local Development

Install and run:

```bash
npm install
npm run dev
```

If you want local Supabase services instead of a hosted project:

```bash
npm run db:start
npm run db:reset
npm run dev
```

If you want to use your hosted Supabase project instead of the local CLI stack:

1. Set `.env.local`
2. Apply the schema and seed
3. Run `npm run dev`

Validation:

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

Open `http://localhost:3000`.

For realtime testing, open two browser tabs with the same local app.

## Deployment Steps

Typical Vercel deployment flow:

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Ensure the target Supabase project has the schema applied:
   - run [schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql) manually, or
   - link the project and run `npm run db:push`
5. Seed the target project if you want demo content.
6. Trigger a production deployment.
7. Verify:
   - board loads
   - create works
   - edit works
   - drag/drop persists
   - realtime sync works across two tabs

## Trade-Offs And Assumptions

- No authentication was added by design.
- `updated_by` comes from the simulated user selector, not a real identity
  provider.
- Realtime covers inserts and updates only.
- Delete is intentionally not implemented.
- Drag ordering uses midpoint spacing without rebalance logic.
- Feedback is lightweight inline messaging instead of a full toast framework.
- Tests focus on the highest-value pure utilities rather than full UI or
  end-to-end coverage.

## What Was Intentionally Not Built

- authentication and authorization
- delete flow
- realtime delete handling
- background rebalance for very tight `position` gaps
- full conflict resolution between concurrent edits
- end-to-end or browser automation tests
- advanced component library or design system abstraction

## Demo Policy Note

The SQL policies are demo-friendly and intentionally permissive for anon access.
That keeps setup simple for a take-home review, but it is not a production-ready
security model.
