-- Initial schema for the mini task management board.
-- Demo-only note:
-- The anonymous policies below are intentionally permissive so the board can be
-- exercised without full auth. Do not ship this policy model to production.

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  position double precision not null,
  updated_by text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_status_position_idx
  on public.tasks (status, position);

create or replace function public.set_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_tasks_updated_at on public.tasks;

create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_tasks_updated_at();

alter table public.tasks enable row level security;

-- Demo-only anonymous access for the take-home simulation.
create policy "demo anon can select tasks"
on public.tasks
for select
to anon
using (true);

create policy "demo anon can insert tasks"
on public.tasks
for insert
to anon
with check (
  status in ('todo', 'in_progress', 'done')
  and char_length(trim(title)) > 0
  and char_length(trim(updated_by)) > 0
);

create policy "demo anon can update tasks"
on public.tasks
for update
to anon
using (true)
with check (
  status in ('todo', 'in_progress', 'done')
  and char_length(trim(title)) > 0
  and char_length(trim(updated_by)) > 0
);
