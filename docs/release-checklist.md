# Release Checklist

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` is set in the target environment
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in the target environment
- Values match the intended Supabase project

## Database Setup

- [supabase/migrations/20260405101702_create_tasks_table.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405101702_create_tasks_table.sql) has been applied
- or [supabase/schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql) has been run manually
- `public.tasks` exists
- RLS is enabled
- Demo anon `select`, `insert`, and `update` policies exist
- Realtime is enabled for the `tasks` table in Supabase

## Seed Data

- [supabase/seed.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.sql) has been run
- Example tasks exist in all 3 columns
- Simulated users `alice`, `bob`, and `charlie` appear in seeded task metadata

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test`

## Local Smoke Check

- App loads with valid env vars
- Board renders all 3 columns
- Create task works
- Edit task works
- Drag within a column works
- Drag across columns works
- Realtime update appears in another tab without refresh

## Vercel Deploy Checks

- Repository is connected to Vercel
- Production env vars are configured in Vercel
- Remote Supabase project has received the migration or manual schema SQL
- Latest commit is deployed
- Build logs show a clean production build
- Production URL loads successfully
- Supabase URL and anon key point to the correct environment

## Demo Recording Checklist

- Clean seed data state before recording
- Browser zoom and window size are readable
- Prepare two tabs for realtime demo
- Show the user switcher
- Show create flow
- Show edit flow
- Show drag/drop reorder
- Show drag/drop cross-column move
- Show realtime sync across tabs
- Mention trade-offs and intentionally omitted features
