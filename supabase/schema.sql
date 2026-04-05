-- Authenticated schema for the mini task management board.
-- Canonical migration source:
-- supabase/migrations/20260405174500_add_auth_boards_and_rls.sql
--
-- Notes:
-- - Authentication uses Supabase Auth and cookie-backed SSR sessions.
-- - Authorization is enforced with Row Level Security.
-- - Users can create multiple boards, invite users by email, and manage
--   membership per board.
-- - Boards support owner/admin/member roles, explicit invite-token acceptance,
--   and archive/delete lifecycle.
-- - Starter task data is not inserted automatically; boards begin empty.

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
  name text not null,
  description text not null default '',
  owner_id uuid not null references public.profiles(id) on delete restrict,
  archived_at timestamptz,
  accent_color text not null default 'sky' check (accent_color in ('sky', 'emerald', 'amber', 'rose', 'slate')),
  invite_policy text not null default 'admins_only' check (invite_policy in ('admins_only', 'members')),
  default_invitee_role text not null default 'member' check (default_invitee_role in ('admin', 'member')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists boards_owner_name_unique_idx
  on public.boards (owner_id, lower(name));

create table if not exists public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (board_id, user_id)
);

create table if not exists public.board_invitations (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  invited_user_id uuid references public.profiles(id) on delete set null,
  token text not null default encode(gen_random_bytes(24), 'hex'),
  token_expires_at timestamptz not null default (timezone('utc', now()) + interval '7 days'),
  last_sent_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz,
  revoked_at timestamptz
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

create index if not exists board_invitations_board_id_idx
  on public.board_invitations (board_id, created_at desc);

create unique index if not exists board_invitations_active_unique_idx
  on public.board_invitations (board_id, lower(email))
  where accepted_at is null and revoked_at is null;

create unique index if not exists board_invitations_token_unique_idx
  on public.board_invitations (token);

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

create or replace function public.board_role_rank(target_role text)
returns integer
language sql
immutable
as $$
  select case target_role
    when 'owner' then 3
    when 'admin' then 2
    when 'member' then 1
    else 0
  end;
$$;

create or replace function public.is_board_admin(target_board_id uuid)
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
      and role in ('owner', 'admin')
  );
$$;

create or replace function public.can_invite_to_board(target_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.board_members
    inner join public.boards
      on public.boards.id = public.board_members.board_id
    where public.board_members.board_id = target_board_id
      and public.board_members.user_id = auth.uid()
      and (
        public.board_members.role in ('owner', 'admin')
        or (
          public.board_members.role = 'member'
          and public.boards.invite_policy = 'members'
        )
      )
  );
$$;

create or replace function public.is_board_active(target_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.boards
    where id = target_board_id
      and archived_at is null
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

  if not public.is_board_admin(target_board_id) then
    raise exception 'Only board owners and admins can add members.';
  end if;

  return query
  select profiles.id, profiles.display_name, profiles.email
  from public.profiles
  where lower(profiles.email) = lower(trim(target_email))
  limit 1;
end;
$$;

create or replace function public.ensure_current_user_profile()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_email text;
begin
  if current_user_id is null then
    raise exception 'Authenticated user required.';
  end if;

  select lower(users.email)
  into current_user_email
  from auth.users as users
  where users.id = current_user_id;

  insert into public.profiles (id, email)
  values (current_user_id, current_user_email)
  on conflict (id) do update
  set
    email = excluded.email,
    updated_at = timezone('utc', now());

  return current_user_id;
end;
$$;

create or replace function public.create_board_with_owner(
  target_name text,
  target_description text default '',
  target_accent_color text default 'sky',
  target_invite_policy text default 'admins_only',
  target_default_invitee_role text default 'member'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_name text := nullif(trim(target_name), '');
  normalized_description text := coalesce(trim(target_description), '');
  normalized_accent_color text := coalesce(nullif(trim(target_accent_color), ''), 'sky');
  normalized_invite_policy text := coalesce(nullif(trim(target_invite_policy), ''), 'admins_only');
  normalized_default_invitee_role text := coalesce(nullif(trim(target_default_invitee_role), ''), 'member');
  new_board_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authenticated user required.';
  end if;

  if normalized_name is null then
    raise exception 'Board name is required.';
  end if;

  if normalized_accent_color not in ('sky', 'emerald', 'amber', 'rose', 'slate') then
    raise exception 'Invalid board accent color.';
  end if;

  if normalized_invite_policy not in ('admins_only', 'members') then
    raise exception 'Invalid board invite policy.';
  end if;

  if normalized_default_invitee_role not in ('admin', 'member') then
    raise exception 'Invalid board default invitee role.';
  end if;

  perform public.ensure_current_user_profile();

  insert into public.boards (
    name,
    description,
    owner_id,
    accent_color,
    invite_policy,
    default_invitee_role
  )
  values (
    normalized_name,
    normalized_description,
    current_user_id,
    normalized_accent_color,
    normalized_invite_policy,
    normalized_default_invitee_role
  )
  returning id into new_board_id;

  insert into public.board_members (board_id, user_id, role)
  values (new_board_id, current_user_id, 'owner')
  on conflict (board_id, user_id) do update
  set role = 'owner';

  return new_board_id;
end;
$$;

create or replace function public.accept_pending_board_invitations()
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_email text;
  accepted_board_ids uuid[] := '{}';
  invite_record record;
  existing_role text;
begin
  if current_user_id is null then
    raise exception 'Authenticated user required.';
  end if;

  select lower(users.email)
  into current_user_email
  from auth.users as users
  where users.id = current_user_id;

  if current_user_email is null then
    return accepted_board_ids;
  end if;

  perform public.ensure_current_user_profile();

  for invite_record in
    select *
    from public.board_invitations
    where lower(email) = current_user_email
      and accepted_at is null
      and revoked_at is null
    order by created_at asc
  loop
    select role
    into existing_role
    from public.board_members
    where board_id = invite_record.board_id
      and user_id = current_user_id;

    if existing_role is null then
      insert into public.board_members (board_id, user_id, role)
      values (invite_record.board_id, current_user_id, invite_record.role)
      on conflict (board_id, user_id) do nothing;
    elsif public.board_role_rank(invite_record.role) > public.board_role_rank(existing_role) then
      update public.board_members
      set role = invite_record.role
      where board_id = invite_record.board_id
        and user_id = current_user_id;
    end if;

    update public.board_invitations
    set
      invited_user_id = current_user_id,
      accepted_at = timezone('utc', now())
    where id = invite_record.id;

    accepted_board_ids := array_append(accepted_board_ids, invite_record.board_id);
  end loop;

  return accepted_board_ids;
end;
$$;

create or replace function public.accept_board_invitation(target_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_user_email text;
  invite_record record;
  existing_role text;
begin
  if current_user_id is null then
    raise exception 'Authenticated user required.';
  end if;

  select lower(users.email)
  into current_user_email
  from auth.users as users
  where users.id = current_user_id;

  if current_user_email is null then
    raise exception 'Authenticated email required.';
  end if;

  select *
  into invite_record
  from public.board_invitations
  where token = target_token;

  if invite_record is null then
    raise exception 'Invitation not found.';
  end if;

  if invite_record.revoked_at is not null then
    raise exception 'This invitation has been revoked.';
  end if;

  if invite_record.accepted_at is not null then
    return invite_record.board_id;
  end if;

  if invite_record.token_expires_at < timezone('utc', now()) then
    raise exception 'This invitation has expired.';
  end if;

  if lower(invite_record.email) <> current_user_email then
    raise exception 'Sign in with the invited email address to accept this invitation.';
  end if;

  perform public.ensure_current_user_profile();

  select role
  into existing_role
  from public.board_members
  where board_id = invite_record.board_id
    and user_id = current_user_id;

  if existing_role is null then
    insert into public.board_members (board_id, user_id, role)
    values (invite_record.board_id, current_user_id, invite_record.role)
    on conflict (board_id, user_id) do nothing;
  elsif public.board_role_rank(invite_record.role) > public.board_role_rank(existing_role) then
    update public.board_members
    set role = invite_record.role
    where board_id = invite_record.board_id
      and user_id = current_user_id;
  end if;

  update public.board_invitations
  set
    invited_user_id = current_user_id,
    accepted_at = timezone('utc', now())
  where id = invite_record.id;

  return invite_record.board_id;
end;
$$;

create or replace function public.is_board_invitation_expired(target_token text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.board_invitations
    where token = target_token
      and token_expires_at < timezone('utc', now())
  );
$$;

create or replace function public.transfer_board_ownership(
  target_board_id uuid,
  target_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authenticated user required.';
  end if;

  if not public.is_board_owner(target_board_id) then
    raise exception 'Only board owners can transfer ownership.';
  end if;

  if not exists (
    select 1
    from public.board_members
    where board_id = target_board_id
      and user_id = target_user_id
  ) then
    raise exception 'The selected user is not a board member.';
  end if;

  update public.boards
  set owner_id = target_user_id
  where id = target_board_id;

  update public.board_members
  set role = 'admin'
  where board_id = target_board_id
    and user_id = current_user_id
    and current_user_id <> target_user_id;

  update public.board_members
  set role = 'owner'
  where board_id = target_board_id
    and user_id = target_user_id;

  return target_board_id;
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
alter table public.board_invitations enable row level security;
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

drop policy if exists "admins can update boards" on public.boards;
create policy "admins can update boards"
on public.boards
for update
to authenticated
using (public.is_board_admin(id))
with check (public.is_board_admin(id));

drop policy if exists "owners can create boards" on public.boards;
create policy "owners can create boards"
on public.boards
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "owners can delete boards" on public.boards;
create policy "owners can delete boards"
on public.boards
for delete
to authenticated
using (public.is_board_owner(id));

drop policy if exists "members can view memberships" on public.board_members;
create policy "members can view memberships"
on public.board_members
for select
to authenticated
using (public.is_board_member(board_id));

drop policy if exists "admins can manage memberships" on public.board_members;
create policy "admins can manage memberships"
on public.board_members
for all
to authenticated
using (public.is_board_admin(board_id))
with check (public.is_board_admin(board_id));

drop policy if exists "admins can manage board invitations" on public.board_invitations;
drop policy if exists "users can view relevant board invitations" on public.board_invitations;
create policy "users can view relevant board invitations"
on public.board_invitations
for select
to authenticated
using (
  public.is_board_admin(board_id)
  or invited_by = auth.uid()
);

drop policy if exists "users can create board invitations" on public.board_invitations;
create policy "users can create board invitations"
on public.board_invitations
for insert
to authenticated
with check (
  public.can_invite_to_board(board_id)
  and invited_by = auth.uid()
);

drop policy if exists "users can update board invitations" on public.board_invitations;
create policy "users can update board invitations"
on public.board_invitations
for update
to authenticated
using (
  public.is_board_admin(board_id)
  or invited_by = auth.uid()
)
with check (
  public.is_board_admin(board_id)
  or invited_by = auth.uid()
);

drop policy if exists "invitees can view their invitations" on public.board_invitations;
create policy "invitees can view their invitations"
on public.board_invitations
for select
to authenticated
using (
  lower(email) = lower((select users.email from auth.users as users where users.id = auth.uid()))
);

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
  and public.is_board_active(board_id)
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
  and public.is_board_active(board_id)
  and updated_by = auth.uid()
);
