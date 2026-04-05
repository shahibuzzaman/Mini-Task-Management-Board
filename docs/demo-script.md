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
then the user can create a board and invite collaborators into it."

## Board And Account UI

Show:

- account card with display name and email
- board list with create and switch controls
- owner-only board settings panel
- board members panel with visible roles
- protected board shell
- three columns with tasks

Say:

"Zustand now stores only modal and editing UI state. TanStack Query owns the
task list and mutations. Auth state comes from Supabase, not from Zustand."

## Role-Based Access

Show:

1. create a board
2. switch between boards from the board list
3. the members panel
4. current user role
5. owner-only add / role change / remove controls
6. owner-only board rename form

Say:

"Each board has two roles: `owner` and `member`. Owners can rename the board
and manage membership. Members can collaborate on tasks but cannot manage
access. Those rules are enforced in both the route handlers and the database
policies."

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

If you loaded the larger dataset, also say:

"Long columns virtualize when idle to keep rendering light, then temporarily
fall back to full rendering during an active drag so the drag-and-drop behavior
stays predictable."

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

"For this pass, I added real multi-board support with board-scoped membership,
but I did not add invite emails for unregistered users, admin tooling, MFA, or
SSO. The goal was a strong production-shaped collaboration model without
overbuilding workspace administration. Performance work is now
focused on memoization, stable render boundaries, a shared task subscription,
and virtualization only where it materially helps."

## Closing

Say:

"The final result keeps the original Kanban experience, but now the board is
backed by real authentication, SSR session handling, route protection, and
database-enforced authorization."
