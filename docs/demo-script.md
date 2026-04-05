# Demo Script

## Intro

Start on the board home page.

Say:

"This is my mini task management board take-home. It uses Next.js App Router,
Supabase for persistence and realtime, TanStack Query for server state, Zustand
for UI-only state, and `dnd-kit` for drag and drop."

Point out:

- 3 columns
- simulated user switcher
- create button
- existing seed data

## Architecture

Say:

"I kept the state boundaries explicit. TanStack Query owns task data, mutations,
optimistic updates, and cache reconciliation. Zustand only stores local UI
state like the active simulated user and whether the task form is open."

Optionally show:

- `src/features/tasks/`
- `src/store/ui-store.ts`
- `src/components/board/`

## Add And Edit

Create flow:

1. Select `alice` or another simulated user.
2. Click `Create task`.
3. Add a title, description, and target column.
4. Submit.

Say:

"Create uses an optimistic cache update first, then reconciles with the server
response. The `updated_by` field comes from the simulated user."

Edit flow:

1. Open a task’s `Edit` action.
2. Change title, description, or column.
3. Save.

Say:

"Edit follows the same pattern: optimistic update, rollback on error, then
final reconciliation against Supabase."

## Drag And Drop

Show:

1. Reordering a task within the same column
2. Moving a task into another column

Say:

"Drag and drop persists `status` and `position`. Order is not based on array
index. Instead, the app computes a midpoint position from neighboring tasks so
common moves do not require rewriting an entire column."

## Realtime Demo

Open two tabs.

In tab A:

1. Create, edit, or drag a task.

In tab B:

1. Show the board updating without refresh.

Say:

"Realtime subscribes once from the board shell to task inserts and updates.
When an event comes in, I patch the query cache directly if the list is already
loaded. If not, I fall back to targeted invalidation."

## Trade-Offs

Say:

"For take-home scope, I intentionally did not add authentication, delete,
rebalance logic for dense ordering gaps, or heavy conflict resolution. The goal
was a clean, explainable vertical slice with correct boundaries and good UX."

## Closing

Say:

"The final result supports create, edit, drag-and-drop ordering, optimistic UI,
and realtime sync across sessions while keeping server state and UI state
strictly separated."
