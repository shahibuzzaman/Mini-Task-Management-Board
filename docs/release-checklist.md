# Release Checklist

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` is set in the target environment
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in the target environment
- `SUPABASE_SERVICE_ROLE_KEY` is set in the target environment
- Values match the intended Supabase project

## Database Setup

- [20260405101702_create_tasks_table.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405101702_create_tasks_table.sql) has been applied if migrating from the original scaffold
- [20260405174500_add_auth_boards_and_rls.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405174500_add_auth_boards_and_rls.sql) has been applied
- [20260405223500_add_multi_board_support.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405223500_add_multi_board_support.sql) has been applied
- [20260405232000_add_invites_admin_and_board_lifecycle.sql](/Users/mac/Desktop/mini-task-management-board/supabase/migrations/20260405232000_add_invites_admin_and_board_lifecycle.sql) has been applied
- or [schema.sql](/Users/mac/Desktop/mini-task-management-board/supabase/schema.sql) has been run for a manual setup path
- `public.profiles`, `public.boards`, `public.board_members`, `public.board_invitations`, and `public.tasks` exist
- RLS is enabled on all five tables
- no demo-open anon task policies remain on the authenticated tables
- Realtime is enabled for `public.tasks`
- [seed.large.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.large.sql) is available for optional performance testing

## Auth Setup

- email/password auth is enabled in the Supabase project
- the project allows redirects to `/auth/callback`
- invitation emails are enabled in the Supabase Auth email provider
- the first signed-up user can access `/board`
- `/board` redirects to `/auth` when signed out

## Bootstrap / Seed Expectations

- [seed.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.sql) has been applied if using CLI reset flow
- understand that boards are created from the authenticated UI, not as anonymous SQL inserts
- a signed-in user can create a board from the sidebar
- run [seed.large.sql](/Users/mac/Desktop/mini-task-management-board/supabase/seed.large.sql) after creating a board if you want a larger render/drag dataset

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test`

## Local Smoke Check

- app loads with valid env vars
- auth page renders
- sign up works
- log in works
- `/board` is protected
- account card shows display name and email
- board creation works
- board switching works
- invitation email can be sent for a new email address
- invite link opens the dedicated acceptance page
- accepting the invite adds the user to the intended board
- invite copy-link fallback works
- owner sees board settings controls
- owner and admin see invitation management controls
- member invite permissions match the board invite policy
- owner can transfer ownership
- owner can archive/unarchive and delete a board
- member does not see invitation or destructive board controls
- board renders all 3 columns
- create task works
- edit task works
- drag within a column works
- drag across columns works
- realtime updates appear in another signed-in tab without refresh
- board remains responsive after loading the large performance seed
- long columns virtualize while idle
- drag/drop still works correctly after virtualization falls back to full rendering

## Vercel Deploy Checks

- repository is connected to Vercel
- production env vars are configured in Vercel
- target Supabase project has the authenticated schema applied
- latest commit is deployed
- build logs show a clean production build
- production URL loads successfully
- auth callback URL is allowed in Supabase

## Demo Recording Checklist

- use a clean browser profile
- start from `/auth`
- show sign in or sign up
- show protected redirect into `/board`
- show account UI
- show board creation
- show board switching
- show invitation flow
- show explicit invite acceptance
- show owner/member access difference
- show create flow
- show edit flow
- show drag/drop reorder
- show drag/drop cross-column move
- prepare two authenticated sessions for realtime
- mention SSR auth, proxy refresh, route protection, and RLS
- mention trade-offs and intentionally omitted features
