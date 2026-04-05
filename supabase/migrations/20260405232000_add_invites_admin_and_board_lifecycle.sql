alter table public.boards
  add column if not exists description text not null default '',
  add column if not exists archived_at timestamptz;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'board_members_role_check'
  ) then
    alter table public.board_members
      drop constraint board_members_role_check;
  end if;
end;
$$;

alter table public.board_members
  add constraint board_members_role_check
  check (role in ('owner', 'admin', 'member'));

create table if not exists public.board_invitations (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  invited_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz,
  revoked_at timestamptz
);

create index if not exists board_invitations_board_id_idx
  on public.board_invitations (board_id, created_at desc);

create unique index if not exists board_invitations_active_unique_idx
  on public.board_invitations (board_id, lower(email))
  where accepted_at is null and revoked_at is null;

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

create or replace function public.create_board_with_owner(
  target_name text,
  target_description text default ''
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
  new_board_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authenticated user required.';
  end if;

  if normalized_name is null then
    raise exception 'Board name is required.';
  end if;

  perform public.ensure_current_user_profile();

  insert into public.boards (name, description, owner_id)
  values (normalized_name, normalized_description, current_user_id)
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

alter table public.board_invitations enable row level security;

drop policy if exists "admins can manage board invitations" on public.board_invitations;
create policy "admins can manage board invitations"
on public.board_invitations
for all
to authenticated
using (public.is_board_admin(board_id))
with check (public.is_board_admin(board_id));

drop policy if exists "invitees can view their invitations" on public.board_invitations;
create policy "invitees can view their invitations"
on public.board_invitations
for select
to authenticated
using (
  lower(email) = lower((select users.email from auth.users as users where users.id = auth.uid()))
);

drop policy if exists "admins can update boards" on public.boards;
create policy "admins can update boards"
on public.boards
for update
to authenticated
using (public.is_board_admin(id))
with check (public.is_board_admin(id));

drop policy if exists "owners can delete boards" on public.boards;
create policy "owners can delete boards"
on public.boards
for delete
to authenticated
using (public.is_board_owner(id));

drop policy if exists "owners can manage memberships" on public.board_members;
create policy "admins can manage memberships"
on public.board_members
for all
to authenticated
using (public.is_board_admin(board_id))
with check (public.is_board_admin(board_id));

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
