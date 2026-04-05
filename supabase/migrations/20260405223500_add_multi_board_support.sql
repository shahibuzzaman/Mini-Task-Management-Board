alter table public.boards
  drop constraint if exists boards_name_key;

create unique index if not exists boards_owner_name_unique_idx
  on public.boards (owner_id, lower(name));

drop function if exists public.ensure_current_user_shared_board();

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

create or replace function public.create_board_with_owner(target_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_name text := nullif(trim(target_name), '');
  new_board_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authenticated user required.';
  end if;

  if normalized_name is null then
    raise exception 'Board name is required.';
  end if;

  perform public.ensure_current_user_profile();

  insert into public.boards (name, owner_id)
  values (normalized_name, current_user_id)
  returning id into new_board_id;

  insert into public.board_members (board_id, user_id, role)
  values (new_board_id, current_user_id, 'owner')
  on conflict (board_id, user_id) do update
  set role = 'owner';

  return new_board_id;
end;
$$;
