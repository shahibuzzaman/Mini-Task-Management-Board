# Demo Script

## Intro

Start on `/auth`.

Say:

"This is my authenticated mini task management board. I kept the original
Kanban product surface, but replaced the simulated-user demo with real
Supabase Auth, server-protected routes, and RLS-backed authorization."

Show:

- login / sign-up screen
- clean, minimal auth UI

## Auth Architecture

Say:

"The important change is that auth is SSR-aware. The app uses separate browser
and server Supabase clients, a proxy for cookie refresh, protected App Router
routes, and route handlers for task writes so the browser never decides actor
identity."

Optionally show:

- `src/lib/supabase/browser.ts`
- `src/lib/supabase/server.ts`
- `src/proxy.ts`
- `supabase/migrations/20260405174500_add_auth_boards_and_rls.sql`

## Sign Up / Log In

1. Create a user or log in with an existing account.
2. Let the app redirect to `/board`.

Say:

"On first authenticated access, the server ensures the user has a profile,
creates or joins the shared board, and bootstraps starter tasks if the board is
empty."

## Board And Account UI

Show:

- account card with display name and email
- protected board shell
- three columns with tasks

Say:

"Zustand now stores only modal and editing UI state. TanStack Query owns the
task list and mutations. Auth state comes from Supabase, not from Zustand."

## Create And Edit

1. Click `Create task`
2. Add title, description, and target column
3. Submit
4. Edit the created task and save

Say:

"Create and edit still use optimistic updates, but the actor fields are stamped
by the server and database triggers from the authenticated session."

## Drag And Drop

1. Reorder a task inside the same column
2. Move a task to another column

Say:

"Ordering is persisted with midpoint-based `position` values rather than array
index, so common moves do not require rewriting the full column."

## Realtime

Open a second authenticated tab or sign in as another user in another browser.

In tab A:

1. Create, edit, or move a task

In tab B:

1. Show the board updating without refresh

Say:

"Realtime is scoped to the authenticated board. The client subscribes to task
changes filtered by `board_id`, and invalidates the board query when updates
arrive."

## Authorization

Say:

"Authorization is RLS-first. Profiles, board membership, and tasks are all
guarded in the database. The app route handlers use a server Supabase client
with verified auth cookies, and the board route itself is protected on the
server."

## Trade-Offs

Say:

"For this pass, I kept the product as a single shared authenticated board. I
did not add invitations, admin tooling, MFA, SSO, or membership management UI.
The goal was a strong first production-shaped auth pass without rewriting the
existing app."

## Closing

Say:

"The final result keeps the original Kanban experience, but now the board is
backed by real authentication, SSR session handling, route protection, and
database-enforced authorization."
