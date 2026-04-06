# TaskTrack

TaskTrack is a production-shaped mini task management board built for a take-home assignment. It focuses on a strong vertical slice: authenticated multi-user collaboration, board-based task management, drag and drop, realtime sync, and clean separation between UI state and server state.

## Links

- Project Link: `Add your deployed app URL here`
- Design Link: `Add your Figma / design reference URL here`

## What This Project Includes

- Email/password authentication with Supabase
- Protected App Router routes
- Multi-board support
- Board members with `owner`, `admin`, and `member` roles
- Add member flow:
  existing user gets added directly, unknown email gets an invitation email
- Board settings:
  accent color, invite policy, archive, delete, ownership transfer, pinning
- Three-column task board:
  `todo`, `in_progress`, `done`
- Create, edit, move, reorder, and delete tasks
- Attachments and comments on tasks
- Realtime task sync across users
- Optimistic mutations with rollback
- UI state and server state kept separate

## Tech Stack

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS
- Supabase:
  database, auth, storage, realtime, RLS
- TanStack Query:
  server state, cache, optimistic updates, invalidation
- Zustand:
  UI-only state
- `@dnd-kit`:
  drag and drop

## Architecture

### State Boundaries

- TanStack Query owns server state:
  task queries, board queries, mutations, cache updates, realtime reconciliation
- Zustand owns transient UI state:
  task form open/close state, edit target, create-board modal, sidebar state, toasts
- Supabase is the source of truth for authenticated data and authorization

### Auth And Security

- Supabase Auth is used with SSR-aware cookie handling
- Protected routes verify the user on the server
- Route handlers perform writes instead of trusting browser state
- Row Level Security enforces board and task access in the database
- Database triggers stamp actor fields such as `created_by` and `updated_by`

### Realtime

- Task updates are synchronized across active users with Supabase Realtime
- Realtime is scoped per board
- Query cache is invalidated and reconciled on incoming changes

## Main Features

### Authentication

- Sign up with display name, email, and password
- Sign in and sign out
- Forgot password and update password flows
- Auth callback handling

### Boards

- Create new boards
- Switch between boards
- Pin boards
- Update board metadata
- Manage invite policy and default invite role
- Archive and delete boards
- Transfer ownership

### Members

- Add existing users directly to a board
- Send invitation emails for unknown emails
- Change member roles
- Remove members

### Tasks

- Create tasks with title, description, status, priority, labels, due date, and assignee
- Edit existing tasks
- Reorder tasks inside a column
- Move tasks across columns
- Delete tasks with a confirmation modal
- Upload and remove attachments
- Add comments

## Folder Structure

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/
    auth/
    invite/
    layout.tsx
    page.tsx
    providers.tsx
  components/
    board/
    layout/
    ui/
  features/
    auth/
      components/
      lib/
      types/
    boards/
      api/
      components/
      hooks/
      lib/
      types/
    dashboard/
      components/
      lib/
    tasks/
      api/
      hooks/
      lib/
      types/
  lib/
    query/
    supabase/
  store/
  types/
supabase/
  migrations/
  schema.sql
  seed.sql
  seed.large.sql
docs/
  demo-script.md
  release-checklist.md
```

## Important Implementation Notes

### Task Delete Behavior

Task delete is backed by both:

- an app route handler at [src/app/api/tasks/[taskId]/route.ts](/Users/mac/Desktop/mini-task-management-board/src/app/api/tasks/[taskId]/route.ts)
- a Supabase RLS delete policy in [20260406133000_add_task_delete_policy.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260406133000_add_task_delete_policy.sql)

If your database schema is behind, task deletion may appear to succeed in the UI but fail at the database layer until migrations are applied.

### Reusable Component Direction

The project is organized around feature-level hooks and smaller view components so pages stay thin and composition-focused. Large workflows such as task orchestration, board members, and dashboard sections are split into dedicated controllers and presentational components.

## Database Model

Core tables:

- `profiles`
- `boards`
- `board_members`
- `board_invitations`
- `board_pins`
- `tasks`
- `task_comments`
- `task_attachments`

Primary schema sources:

- [supabase/schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql)
- [supabase/migrations](/Users/mac/Desktop/mini-task-management-board/supabase/migrations)

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Reference file:

- [.env.example](/Users/mac/Desktop/mini-task-management-board/.env.example)

## Google OAuth Setup

If you want Google sign-in/sign-up in addition to email/password auth, configure both Google Cloud and Supabase.

### 1. Create a Google OAuth client

In Google Cloud Console:

1. Create or select a project
2. Configure the OAuth consent screen
3. Create an OAuth client with application type `Web application`

Add these local development values:

- Authorized JavaScript origin:
  - `http://localhost:3000`
- Authorized redirect URI:
  - `https://aljhbfoywjmmugpfbvfd.supabase.co/auth/v1/callback`

For production, also add your deployed app origin and keep the Supabase callback URI that belongs to the production Supabase project.

### 2. Enable Google in Supabase

In Supabase Dashboard:

1. Open `Authentication -> Providers -> Google`
2. Enable the Google provider
3. Paste the Google OAuth `Client ID`
4. Paste the Google OAuth `Client Secret`

### 3. Configure Supabase redirect URLs

In Supabase Dashboard under `Authentication -> URL Configuration`:

- Set `Site URL` to:
  - `http://localhost:3000`
- Add this redirect URL:
  - `http://localhost:3000/auth/callback`

If you deploy the app, also add your production callback URL, for example:

- `https://your-app-domain.com/auth/callback`

### 4. App behavior

This repository already includes Google OAuth buttons in the auth forms and routes Google auth through:

- [`src/features/auth/components/sign-in-form.tsx`](/Users/mac/Desktop/mini-task-management-board/src/features/auth/components/sign-in-form.tsx)
- [`src/features/auth/components/sign-up-form.tsx`](/Users/mac/Desktop/mini-task-management-board/src/features/auth/components/sign-up-form.tsx)
- [`src/app/auth/callback/route.ts`](/Users/mac/Desktop/mini-task-management-board/src/app/auth/callback/route.ts)

The browser redirects to your app callback route:

- `http://localhost:3000/auth/callback`

Supabase exchanges the Google auth code and then redirects the user into the app.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` using the values from your Supabase project.

### 3. Apply the database schema

Choose one path:

1. Run Supabase migrations
2. Or run [schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql) manually against the target project

If using the Supabase CLI:

```bash
npm run db:push
```

If you see an auth error from the CLI, run `supabase login` first or set `SUPABASE_ACCESS_TOKEN`.

### 4. Start the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
npm run db:start
npm run db:stop
npm run db:status
npm run db:reset
npm run db:push
```

## Validation

Recommended checks:

```bash
npm run lint
npm run typecheck
npm run build
npm run test
```

Also validate:

- sign up and sign in
- board creation
- add member flow
- invitation email flow
- task create/edit/delete
- drag and drop reorder
- cross-column move
- realtime sync in a second session

## Demo Notes

For the demo, emphasize:

- SSR-aware Supabase auth
- RLS-backed access control
- clear separation of UI state vs server state
- optimistic updates and realtime sync
- board-scoped collaboration rather than shallow feature breadth

## Trade-Offs

- No full organization admin layer
- No authentication providers beyond email/password
- Delete was added for tasks because it is a small, high-value extension of the existing task lifecycle
- The implementation prioritizes a coherent, explainable product slice over broad feature coverage
