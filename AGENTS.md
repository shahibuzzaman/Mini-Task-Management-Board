# AGENTS.md

## Goal
- Build a mini task management board for a take-home assignment.
- Prefer a strong, explainable vertical slice over broad but shallow feature coverage.

## Product Requirements
- 3 columns: `todo`, `in_progress`, `done`
- Task cards with `id`, `title`, `description`
- Drag tasks between columns
- Reorder tasks within a column
- Realtime updates across users
- Simple multi-user simulation, no full auth
- Create and update tasks
- Clear separation of UI state vs server state

## Preferred Stack
- Next.js App Router
- TypeScript with strict mode enabled
- Tailwind CSS
- Supabase for database and realtime
- `@dnd-kit` for drag and drop
- Zustand for UI state only
- TanStack Query for server state only

## Engineering Rules
- Do not add authentication
- Do not add delete unless it is nearly free and does not distract from the core slice
- Avoid `any`
- Favor small, reusable components
- Use a feature-based folder structure
- Add comments only where they improve clarity
- Keep UI state and server state clearly separated
- Make minimal, production-shaped changes

## Suggested Architecture
- Use Supabase as the source of truth for tasks and realtime broadcasts
- Use TanStack Query for loading, mutations, cache updates, and server synchronization
- Use Zustand only for transient UI concerns such as drag state, modal state, or optimistic interaction helpers that are not canonical server data
- Keep task domain logic grouped in a dedicated feature area
- Prefer server/client boundaries that are easy to explain in a take-home review

## Suggested Folder Structure
```text
src/
  app/
    layout.tsx
    page.tsx
    providers.tsx
  features/
    board/
      components/
      hooks/
      lib/
      types/
    tasks/
      components/
      hooks/
      lib/
      types/
  components/
    ui/
  lib/
    supabase/
    query/
  store/
  styles/
```

## Delivery Priorities
1. Establish app shell, providers, and strict project setup
2. Model tasks and columns cleanly
3. Implement board rendering and task CRUD path
4. Add drag-and-drop with reorder and cross-column moves
5. Add Supabase persistence and realtime sync
6. Tighten UX, states, and code quality

## Validation
- Run lint, typecheck, and build after each major step when practical
- Prefer catching architecture drift early instead of batching fixes late

## Working Rules For Future Codex Runs
- Inspect the current repository state before making changes
- Do not start with broad scaffolding beyond what the current phase needs
- Preserve strict TypeScript
- Avoid irreversible product decisions unless necessary
- Ask questions only if blocked by missing credentials or another hard dependency
