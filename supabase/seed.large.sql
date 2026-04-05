-- Optional large-data seed for performance testing.
-- Usage:
-- 1. Sign up once and open /board so the shared board exists.
-- 2. Run this file in Supabase SQL Editor.
-- 3. Reload the board and verify drag/drop responsiveness with larger lists.

do $$
declare
  shared_board_id uuid;
  shared_board_owner_id uuid;
begin
  select id, owner_id
  into shared_board_id, shared_board_owner_id
  from public.boards
  where name = 'Shared Board'
  limit 1;

  if shared_board_id is null or shared_board_owner_id is null then
    raise exception 'Shared Board was not found. Sign in once before running seed.large.sql.';
  end if;

  delete from public.tasks
  where board_id = shared_board_id
    and title like '[perf] %';

  insert into public.tasks (
    board_id,
    title,
    description,
    status,
    position,
    created_by,
    updated_by
  )
  select
    shared_board_id,
    format('[perf] Task %s', series.task_number),
    format(
      'Large-seed performance task %s for drag/drop and render testing.',
      series.task_number
    ),
    series.status,
    series.position,
    shared_board_owner_id,
    shared_board_owner_id
  from (
    select
      gs as task_number,
      case
        when gs <= 60 then 'todo'
        when gs <= 120 then 'in_progress'
        else 'done'
      end::text as status,
      ((gs - 1) % 60 + 1) * 1000 as position
    from generate_series(1, 180) as gs
  ) as series;
end;
$$;
