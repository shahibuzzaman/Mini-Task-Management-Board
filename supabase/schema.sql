-- Authenticated schema for the mini task management board.
-- Canonical migration source:
-- supabase/migrations/20260405174500_add_auth_boards_and_rls.sql
--
-- Notes:
-- - Authentication uses Supabase Auth and cookie-backed SSR sessions.
-- - Authorization is enforced with Row Level Security.
-- - The current product surface exposes one authenticated shared board.
-- - Seed task data is created the first time an authenticated user opens the board.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (board_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  position double precision not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  updated_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists board_members_user_id_idx
  on public.board_members (user_id);

create index if not exists tasks_board_status_position_idx
  on public.tasks (board_id, status, position);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    lower(new.email)
  )
  on conflict (id) do update
  set
    display_name = excluded.display_name,
    email = excluded.email,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create or replace function public.set_task_actor_fields()
returns trigger
language plpgsql
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authenticated user required.';
  end if;

  if tg_op = 'INSERT' then
    new.created_by = current_user_id;
  else
    new.board_id = old.board_id;
    new.created_by = old.created_by;
  end if;

  new.updated_by = current_user_id;

  return new;
end;
$$;

create or replace function public.is_board_member(target_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.board_members
    where board_id = target_board_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_board_owner(target_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.board_members
    where board_id = target_board_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

create or replace function public.lookup_board_member_candidate(
  target_board_id uuid,
  target_email text
)
returns table (
  id uuid,
  display_name text,
  email text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authenticated user required.';
  end if;

  if not public.is_board_owner(target_board_id) then
    raise exception 'Only board owners can add members.';
  end if;

  return query
  select profiles.id, profiles.display_name, profiles.email
  from public.profiles
  where lower(profiles.email) = lower(trim(target_email))
  limit 1;
end;
$$;

create or replace function public.ensure_current_user_shared_board()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  shared_board_id uuid;
  existing_role text;
  task_count bigint;
begin
  if current_user_id is null then
    raise exception 'Authenticated user required.';
  end if;

  insert into public.profiles (id, email)
  values (
    current_user_id,
    lower((select users.email from auth.users as users where users.id = current_user_id))
  )
  on conflict (id) do nothing;

  select id
  into shared_board_id
  from public.boards
  where name = 'Shared Board'
  limit 1
  for update;

  if shared_board_id is null then
    insert into public.boards (name, owner_id)
    values ('Shared Board', current_user_id)
    returning id into shared_board_id;

    existing_role := 'owner';
  else
    select role
    into existing_role
    from public.board_members
    where board_id = shared_board_id
      and user_id = current_user_id;
  end if;

  insert into public.board_members (board_id, user_id, role)
  values (shared_board_id, current_user_id, coalesce(existing_role, 'member'))
  on conflict (board_id, user_id) do nothing;

  select count(*)
  into task_count
  from public.tasks
  where board_id = shared_board_id;

  if task_count = 0 then
    insert into public.tasks (
      board_id,
      title,
      description,
      status,
      position,
      created_by,
      updated_by
    )
    values
      (
        shared_board_id,
        'Review authenticated board architecture',
        'Confirm SSR session handling, protected routes, and RLS boundaries before expanding the product.',
        'todo',
        1000,
        current_user_id,
        current_user_id
      ),
      (
        shared_board_id,
        'Wire task mutations through authenticated routes',
        'Use server-backed handlers so the browser never stamps actor identity directly.',
        'in_progress',
        1000,
        current_user_id,
        current_user_id
      ),
      (
        shared_board_id,
        'Validate realtime across signed-in users',
        'Open two authenticated sessions and confirm inserts, edits, and moves stay in sync.',
        'done',
        1000,
        current_user_id,
        current_user_id
      );
  end if;

  return shared_board_id;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at
before update on public.boards
for each row
execute function public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

drop trigger if exists set_tasks_actor_fields on public.tasks;
create trigger set_tasks_actor_fields
before insert or update on public.tasks
for each row
execute function public.set_task_actor_fields();

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.board_members enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "profiles are self managed" on public.profiles;
create policy "profiles are self managed"
on public.profiles
for all
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles are visible to board collaborators" on public.profiles;
create policy "profiles are visible to board collaborators"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.board_members as viewer_membership
    join public.board_members as collaborator_membership
      on collaborator_membership.board_id = viewer_membership.board_id
    where viewer_membership.user_id = auth.uid()
      and collaborator_membership.user_id = public.profiles.id
  )
);

drop policy if exists "boards are visible to members" on public.boards;
create policy "boards are visible to members"
on public.boards
for select
to authenticated
using (public.is_board_member(id));

drop policy if exists "owners can update boards" on public.boards;
create policy "owners can update boards"
on public.boards
for update
to authenticated
using (public.is_board_owner(id))
with check (public.is_board_owner(id));

drop policy if exists "owners can create boards" on public.boards;
create policy "owners can create boards"
on public.boards
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "members can view memberships" on public.board_members;
create policy "members can view memberships"
on public.board_members
for select
to authenticated
using (public.is_board_member(board_id));

drop policy if exists "owners can manage memberships" on public.board_members;
create policy "owners can manage memberships"
on public.board_members
for all
to authenticated
using (public.is_board_owner(board_id))
with check (public.is_board_owner(board_id));

drop policy if exists "members can read tasks" on public.tasks;
create policy "members can read tasks"
on public.tasks
for select
to authenticated
using (public.is_board_member(board_id));

drop policy if exists "members can insert tasks" on public.tasks;
create policy "members can insert tasks"
on public.tasks
for insert
to authenticated
with check (
  public.is_board_member(board_id)
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

drop policy if exists "members can update tasks" on public.tasks;
create policy "members can update tasks"
on public.tasks
for update
to authenticated
using (public.is_board_member(board_id))
with check (
  public.is_board_member(board_id)
  and updated_by = auth.uid()
);
