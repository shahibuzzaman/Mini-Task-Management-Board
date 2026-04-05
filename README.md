# Mini Task Management Board

A production-shaped take-home implementation of a collaborative Kanban board
with:

- Supabase Auth with cookie-backed SSR sessions
- protected board routes
- multi-board creation and switching
- email invitation flow with explicit invite-token acceptance
- owner/admin/member role management per board
- board archive, delete, and ownership transfer controls
- richer board settings for accent color and invite policy
- create, edit, reorder, and cross-column task moves
- optimistic UI for mutations
- realtime sync across signed-in users
- targeted render optimizations for larger task sets
- strict separation between UI state and server state

## Architecture Overview

The app is built around four explicit responsibilities:

- `Next.js App Router` provides the shell, protected routes, route handlers, and
  auth callback flow.
- `Supabase Auth + @supabase/ssr` provide cookie-based session handling for both
  server rendering and browser auth flows.
- `TanStack Query` owns server state only:
  task fetching, optimistic updates, rollback, cache reconciliation, and
  invalidation.
- `Zustand` owns UI state only:
  task form open/close state and `editingTaskId`.

The browser never decides actor identity for task writes. Authenticated route
handlers and database triggers stamp `created_by` and `updated_by`, and Row
Level Security remains the source of truth for access control.

## Folder Structure

```text
src/
  app/
    api/
      board-invitations/
      boards/
      board-members/
      tasks/
    auth/
      callback/
      page.tsx
    board/
      page.tsx
    layout.tsx
    page.tsx
    providers.tsx
    proxy.ts
  components/
    board/
  features/
    auth/
      components/
      lib/
      types/
    boards/
      api/
      hooks/
      lib/
      query-keys.ts
      types/
    tasks/
      api/
      hooks/
      lib/
      types/
      query-keys.ts
  lib/
    query/
    supabase/
  store/
  types/
supabase/
  config.toml
  migrations/
  schema.sql
  seed.sql
  seed.large.sql
docs/
  demo-script.md
  release-checklist.md
```

Structure rules:

- `features/auth`: auth forms, auth helpers, and viewer types
- `features/boards`: board creation, switching, membership APIs, hooks, and board metadata helpers
- `features/tasks/api`: client-side fetchers for authenticated app APIs
- `features/tasks/hooks`: TanStack Query hooks and realtime wiring
- `features/tasks/lib`: ordering helpers, task mapping, optimistic cache helpers
- `lib/supabase`: browser, server, and proxy-safe Supabase clients
- `store`: Zustand UI-only state

## Auth Strategy

This project now uses `email + password` authentication.

Why this choice:

- it fits the existing form-driven UX cleanly
- it does not require a separate passwordless callback-first experience
- it keeps local and hosted setup simple

Implemented auth flow:

- sign up with `display_name`, email, and password
- log in with email and password
- handle Supabase auth callback at `/auth/callback`
- sign out from the authenticated board shell
- protect `/board` server-side
- redirect `/` to `/board` or `/auth` based on the verified session

## Supabase SSR Client Setup

There are separate Supabase clients for distinct runtimes:

- [browser.ts](/Users/mac/Desktop/mini-task-management-board/src/lib/supabase/browser.ts)
  creates the browser client for auth actions and realtime subscriptions.
- [server.ts](/Users/mac/Desktop/mini-task-management-board/src/lib/supabase/server.ts)
  creates the cookie-aware server client for server components and route
  handlers.
- [proxy.ts](/Users/mac/Desktop/mini-task-management-board/src/proxy.ts)
  refreshes auth cookies before requests hit the app.

The protected board page and task APIs use `auth.getUser()` on the server so
authorization decisions are based on a verified identity rather than browser
state.

## State Boundaries

### Why Zustand Is Used For UI State Only

Zustand stores only transient UI concerns:

- whether the task form is open
- which task is being edited

The authenticated user, board membership, and task list are not duplicated into
Zustand.

### Why TanStack Query Is Used For Server State Only

TanStack Query owns:

- task reads from authenticated API routes
- optimistic create, edit, and move flows
- rollback on failure
- reconciliation with server responses
- targeted invalidation after mutations and realtime updates

This keeps the board’s server-backed data model centralized and explainable.

## Data Model

The authenticated model uses:

### `public.profiles`

```sql
id uuid primary key references auth.users(id) on delete cascade
display_name text
email text not null unique
created_at timestamptz not null
updated_at timestamptz not null
```

### `public.boards`

```sql
id uuid primary key
name text not null
description text not null default ''
owner_id uuid references public.profiles(id)
archived_at timestamptz null
created_at timestamptz not null
updated_at timestamptz not null
```

### `public.board_members`

```sql
board_id uuid references public.boards(id) on delete cascade
user_id uuid references public.profiles(id) on delete cascade
role text check role in ('owner', 'admin', 'member')
primary key (board_id, user_id)
```

### `public.board_invitations`

```sql
id uuid primary key
board_id uuid references public.boards(id) on delete cascade
email text not null
role text check role in ('owner', 'admin', 'member')
invited_by uuid references public.profiles(id)
invited_user_id uuid references public.profiles(id) null
created_at timestamptz not null
accepted_at timestamptz null
revoked_at timestamptz null
```

### `public.tasks`

```sql
id uuid primary key
board_id uuid references public.boards(id) on delete cascade
title text not null
description text not null default ''
status text check in ('todo', 'in_progress', 'done')
position double precision not null
created_by uuid references public.profiles(id)
updated_by uuid references public.profiles(id)
created_at timestamptz not null
updated_at timestamptz not null
```

Supporting files:

- [20260405101702_create_tasks_table.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405101702_create_tasks_table.sql)
- [20260405174500_add_auth_boards_and_rls.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405174500_add_auth_boards_and_rls.sql)
- [20260405223500_add_multi_board_support.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405223500_add_multi_board_support.sql)
- [20260405232000_add_invites_admin_and_board_lifecycle.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405232000_add_invites_admin_and_board_lifecycle.sql)
- [schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql)

## Authorization And RLS Approach

Authorization is RLS-first.

High-level rules:

- users can manage their own profile
- users can read boards they belong to
- users can read memberships for boards they belong to
- users can manage invitations only if they are board `owner` or `admin`
- users can read, insert, and update tasks only inside boards they belong to
- task writes are blocked when the board is archived
- task actor identity is stamped by a database trigger from `auth.uid()`

Helper database functions:

- `public.is_board_member(uuid)`
- `public.is_board_admin(uuid)`
- `public.is_board_owner(uuid)`
- `public.is_board_active(uuid)`
- `public.ensure_current_user_profile()`
- `public.create_board_with_owner(text)`
- `public.accept_pending_board_invitations()`
- `public.accept_board_invitation(text)`
- `public.transfer_board_ownership(uuid, uuid)`
- `public.lookup_board_member_candidate(uuid, text)`

The current product surface exposes board-scoped collaboration. After
authentication, the app ensures:

1. the user has a profile
2. the user can create a board from the board sidebar
3. each selected board loads only if the user is a member
4. membership and task access are always scoped to the selected board

Each board exposes a richer administration surface:

- `owner` can invite users by email, including not-yet-registered users
- `owner` can promote or demote admins and members
- `owner` can transfer ownership
- `owner` can archive, unarchive, or delete the board
- `admin` can invite users, update pending invitation roles, and manage non-owner memberships
- `member` can see the member list but cannot manage it
- `owner` and `admin` can update board name and description

## Route Protection

Protected app behavior:

- `/board` is server-protected and redirects unauthenticated users to `/auth`
- `/auth` redirects authenticated users back to `/board`
- `/` resolves to the correct destination from the server

This is intentionally not client-only protection.

## Task Data Flow

Task reads and writes now go through authenticated Next route handlers:

- `GET /api/boards`
- `POST /api/boards`
- `PATCH /api/boards/[boardId]`
- `DELETE /api/boards/[boardId]`
- `POST /api/boards/[boardId]/transfer`
- `GET /api/board-invitations?boardId=...`
- `POST /api/board-invitations`
- `PATCH /api/board-invitations/[invitationId]`
- `DELETE /api/board-invitations/[invitationId]?boardId=...`
- `GET /api/board-members?boardId=...`
- `POST /api/board-members`
- `PATCH /api/board-members/[userId]`
- `DELETE /api/board-members/[userId]?boardId=...`
- `GET /api/tasks?boardId=...`
- `POST /api/tasks`
- `PATCH /api/tasks/[taskId]?boardId=...`

Why:

- keeps the browser from stamping actor identity
- keeps task authorization behind server-verified sessions
- makes the trust boundary easy to explain in review

## Realtime Implementation

Realtime remains Supabase-based, but it is now scoped to the authenticated
board:

- the browser subscribes to `public.tasks`
- the subscription uses a `board_id` filter
- incoming insert and update events invalidate the board’s query cache

Trade-off:

- direct cache patching was intentionally replaced with targeted invalidation in
  realtime because the event payload does not include joined profile display
  data, and correctness is more important here than being clever

## Ordering Strategy With `position`

Persisted order is based on numeric `position`, not array index.

Rules:

- new tasks go to the end of the chosen column
- drag and drop computes the new position from neighboring tasks
- inserts and reorders use midpoint spacing
- canonical ordering sorts by `position` within each status column

This avoids full-column rewrites for common moves while keeping the logic easy
to explain.

## Performance Approach

Performance work in this repo is intentionally scoped, not speculative.

Implemented:

- `TaskCard` remains memoized
- `BoardColumn` uses memoization with a focused prop comparator so unaffected
  columns can skip rerendering when another column changes
- `SortableTaskCard` is memoized
- the board now shares a single tasks query subscription between the shell and
  the drag surface instead of subscribing twice
- long columns use `@tanstack/react-virtual` so idle render work stays bounded
  with the larger dataset
- virtualization automatically falls back to full rendering during active drag
  so dnd-kit keeps stable sortable behavior
- [seed.large.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.large.sql)
  provides an optional larger dataset for render and drag/drop smoke testing

This keeps the performance pass explicit: stable props and reduced
subscriptions for normal interaction, plus virtualization when column size
actually justifies it.

## Optimistic UI Approach

Create, edit, and move mutations use `onMutate`:

1. cancel the in-flight tasks query for the current board
2. snapshot the previous cached list
3. write an optimistic task change
4. rollback on error
5. reconcile with the server response on success
6. invalidate on settle

Optimistic rows use the authenticated viewer’s `displayName` for temporary UI
feedback, but the server still stamps the canonical actor fields.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service-role key is used only in server-only invitation routes. It must
never be exposed in browser code or `NEXT_PUBLIC_*` env vars.

## Setup

### Hosted Supabase

1. Install dependencies:

```bash
npm install
```

2. Copy env values into `.env.local`.
3. Apply the schema:
   - run [schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql) in the SQL Editor, or
   - push migrations with the CLI
4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`
6. Sign up for an account
7. Create a board from the sidebar
8. Open the board, invite collaborators, and start creating tasks

Optional performance dataset:

- after at least one board exists, run
  [seed.large.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.large.sql)
  to add 180 extra tasks to the earliest board for performance testing

### Supabase CLI Workflow

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npm run db:push
npm run dev
```

For local Supabase:

```bash
npm run db:start
npm run db:reset
npm run dev
```

## Migration / Reset Notes

This auth pass introduces a clean reset path rather than attempting to map the
old simulated `alice/bob/charlie` text attribution into real auth user IDs.

What happens:

- the old public `tasks` table is moved out of the primary app surface
- the new authenticated schema becomes canonical
- users create boards explicitly from the authenticated app UI

This keeps the migration safe and reviewable without inventing fake identity
mapping.

## Validation

Run:

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

## Deployment Steps

1. Push the repo to GitHub.
2. Import the repository into Vercel.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Apply migrations or run [schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql) on the target Supabase project.
5. Deploy.
6. Sign up for a real user in production.
7. Verify:
   - auth works
   - board creation and switching work
   - invitation emails and acceptance work
   - owner/admin/member management works per board
   - archive/delete/transfer ownership flows work
   - `/board` is protected
   - create/edit/move work
   - realtime works across two signed-in sessions

## Trade-Offs And Limitations

- Realtime handles inserts and updates; delete handling is still omitted.
- Midpoint ordering still does not include a rebalance job for dense gaps.
- There is no MFA, SSO, organization-wide admin console, or fine-grained
  custom permissions beyond `owner`, `admin`, and `member`.
- Invitation email delivery still depends on the Supabase Auth email provider
  configured for the target project.

## What Was Intentionally Not Built

- enterprise auth features
- MFA
- SSO
- organization-wide admin console
- custom permissions beyond `owner`, `admin`, and `member`
- full conflict resolution for concurrent edits
