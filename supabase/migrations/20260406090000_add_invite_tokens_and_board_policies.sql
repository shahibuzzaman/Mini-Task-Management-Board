alter table public.boards
  add column if not exists accent_color text not null default 'sky'
    check (accent_color in ('sky', 'emerald', 'amber', 'rose', 'slate')),
  add column if not exists invite_policy text not null default 'admins_only'
    check (invite_policy in ('admins_only', 'members')),
  add column if not exists default_invitee_role text not null default 'member'
    check (default_invitee_role in ('admin', 'member'));

alter table public.board_invitations
  add column if not exists token text not null default encode(extensions.gen_random_bytes(24), 'hex'),
  add column if not exists token_expires_at timestamptz not null default (timezone('utc', now()) + interval '7 days'),
  add column if not exists last_sent_at timestamptz not null default timezone('utc', now());

create unique index if not exists board_invitations_token_unique_idx
  on public.board_invitations (token);

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
