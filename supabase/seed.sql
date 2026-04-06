-- Demo seed for local/dev environments.
-- Creates two confirmed auth users, one shared board, memberships, and starter tasks.
--
-- Demo credentials:
-- - Owner:  owner.demo@tasktrack.local / DemoPass@123
-- - Member: member.demo@tasktrack.local / DemoPass@123

create extension if not exists pgcrypto;

do $$
declare
  demo_owner_user_id constant uuid := '11111111-1111-4111-8111-111111111111';
  demo_member_user_id constant uuid := '22222222-2222-4222-8222-222222222222';
  demo_board_id constant uuid := '33333333-3333-4333-8333-333333333333';
  demo_todo_task_id constant uuid := '44444444-4444-4444-8444-444444444441';
  demo_progress_task_id constant uuid := '44444444-4444-4444-8444-444444444442';
  demo_done_task_id constant uuid := '44444444-4444-4444-8444-444444444443';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  values
    (
      '00000000-0000-0000-0000-000000000000',
      demo_owner_user_id,
      'authenticated',
      'authenticated',
      'owner.demo@tasktrack.local',
      crypt('DemoPass@123', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Demo Owner"}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      demo_member_user_id,
      'authenticated',
      'authenticated',
      'member.demo@tasktrack.local',
      crypt('DemoPass@123', gen_salt('bf')),
      timezone('utc', now()),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"Demo Member"}'::jsonb,
      timezone('utc', now()),
      timezone('utc', now()),
      '',
      '',
      '',
      ''
    )
  on conflict (id) do update
  set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = timezone('utc', now());

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at,
    last_sign_in_at
  )
  values
    (
      '55555555-5555-4555-8555-555555555551',
      demo_owner_user_id,
      format('{"sub":"%s","email":"%s","email_verified":true}', demo_owner_user_id, 'owner.demo@tasktrack.local')::jsonb,
      'email',
      'owner.demo@tasktrack.local',
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now())
    ),
    (
      '55555555-5555-4555-8555-555555555552',
      demo_member_user_id,
      format('{"sub":"%s","email":"%s","email_verified":true}', demo_member_user_id, 'member.demo@tasktrack.local')::jsonb,
      'email',
      'member.demo@tasktrack.local',
      timezone('utc', now()),
      timezone('utc', now()),
      timezone('utc', now())
    )
  on conflict (provider, provider_id) do update
  set
    user_id = excluded.user_id,
    identity_data = excluded.identity_data,
    updated_at = timezone('utc', now()),
    last_sign_in_at = timezone('utc', now());

  insert into public.profiles (id, display_name, email)
  values
    (demo_owner_user_id, 'Demo Owner', 'owner.demo@tasktrack.local'),
    (demo_member_user_id, 'Demo Member', 'member.demo@tasktrack.local')
  on conflict (id) do update
  set
    display_name = excluded.display_name,
    email = excluded.email,
    updated_at = timezone('utc', now());

  insert into public.boards (
    id,
    name,
    description,
    owner_id,
    accent_color,
    invite_policy,
    default_invitee_role
  )
  values (
    demo_board_id,
    'Launch Planning Board',
    'Shared demo board for local sign-in, drag/drop, comments, and role testing.',
    demo_owner_user_id,
    'emerald',
    'admins_only',
    'member'
  )
  on conflict (id) do update
  set
    name = excluded.name,
    description = excluded.description,
    owner_id = excluded.owner_id,
    accent_color = excluded.accent_color,
    invite_policy = excluded.invite_policy,
    default_invitee_role = excluded.default_invitee_role,
    updated_at = timezone('utc', now());

  insert into public.board_members (board_id, user_id, role)
  values
    (demo_board_id, demo_owner_user_id, 'owner'),
    (demo_board_id, demo_member_user_id, 'member')
  on conflict (board_id, user_id) do update
  set role = excluded.role;

  insert into public.board_pins (board_id, user_id)
  values
    (demo_board_id, demo_owner_user_id),
    (demo_board_id, demo_member_user_id)
  on conflict (board_id, user_id) do nothing;

  perform set_config('request.jwt.claim.sub', demo_owner_user_id::text, true);

  insert into public.tasks (
    id,
    board_id,
    title,
    description,
    status,
    priority,
    due_at,
    labels,
    assignee_id,
    position,
    created_by,
    updated_by
  )
  values
    (
      demo_todo_task_id,
      demo_board_id,
      'Finalize demo checklist',
      'Review auth flow, manual test path, and the release checklist before recording the walkthrough.',
      'todo',
      'high',
      timezone('utc', now()) + interval '2 days',
      array['demo', 'qa'],
      demo_owner_user_id,
      1024,
      demo_owner_user_id,
      demo_owner_user_id
    ),
    (
      demo_progress_task_id,
      demo_board_id,
      'Prepare stakeholder update',
      'Summarize board collaboration, permissions, and realtime behavior for the take-home review.',
      'in_progress',
      'medium',
      timezone('utc', now()) + interval '1 day',
      array['docs', 'review'],
      demo_member_user_id,
      1024,
      demo_owner_user_id,
      demo_owner_user_id
    )
  on conflict (id) do update
  set
    title = excluded.title,
    description = excluded.description,
    status = excluded.status,
    priority = excluded.priority,
    due_at = excluded.due_at,
    labels = excluded.labels,
    assignee_id = excluded.assignee_id,
    position = excluded.position;

  perform set_config('request.jwt.claim.sub', demo_member_user_id::text, true);

  insert into public.tasks (
    id,
    board_id,
    title,
    description,
    status,
    priority,
    due_at,
    labels,
    assignee_id,
    position,
    created_by,
    updated_by
  )
  values (
    demo_done_task_id,
    demo_board_id,
    'Seed initial board data',
    'Two demo accounts now land in a board with starter tasks so the drag and realtime flows can be shown immediately.',
    'done',
    'low',
    timezone('utc', now()) - interval '1 day',
    array['setup'],
    demo_member_user_id,
    1024,
    demo_member_user_id,
    demo_member_user_id
  )
  on conflict (id) do update
  set
    title = excluded.title,
    description = excluded.description,
    status = excluded.status,
    priority = excluded.priority,
    due_at = excluded.due_at,
    labels = excluded.labels,
    assignee_id = excluded.assignee_id,
    position = excluded.position;

  insert into public.task_comments (task_id, body, created_by)
  values
    (
      demo_progress_task_id,
      'Draft is in progress. I will post the walkthrough script after the dashboard metrics are rechecked.',
      demo_member_user_id
    ),
    (
      demo_done_task_id,
      'Seed confirmed. This board is ready for a local demo without manual setup.',
      demo_owner_user_id
    )
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub', '', true);
end $$;

select
  'Seeded demo users, one shared board, and starter tasks.' as message,
  'owner.demo@tasktrack.local / DemoPass@123' as owner_credentials,
  'member.demo@tasktrack.local / DemoPass@123' as member_credentials;
