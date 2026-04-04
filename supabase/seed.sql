insert into public.tasks (title, description, status, position, updated_by)
values
  (
    'Draft task domain types',
    'Define shared task contracts before wiring queries and mutations.',
    'todo',
    1000,
    'alice'
  ),
  (
    'Prepare create task mutation',
    'Map out the insert shape and cache update plan for the board slice.',
    'todo',
    2000,
    'bob'
  ),
  (
    'Set up Supabase foundation',
    'Add schema, seed data, typed env helpers, and a safe browser client.',
    'in_progress',
    1000,
    'charlie'
  ),
  (
    'Document demo-only policies',
    'Explain why anon access is acceptable for the take-home but not production.',
    'in_progress',
    2000,
    'alice'
  ),
  (
    'Scaffold Next.js baseline',
    'Finish the app router shell with Tailwind, React Query, and Zustand setup.',
    'done',
    1000,
    'bob'
  ),
  (
    'Verify local build pipeline',
    'Run lint, typecheck, and build after the Supabase foundation lands.',
    'done',
    2000,
    'charlie'
  )
on conflict do nothing;
