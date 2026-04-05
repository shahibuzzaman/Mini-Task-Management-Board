alter table public.tasks
  add column if not exists priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  add column if not exists due_at timestamptz,
  add column if not exists labels text[] not null default '{}',
  add column if not exists assignee_id uuid references public.profiles(id) on delete set null;

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  body text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists task_comments_task_id_idx
  on public.task_comments (task_id, created_at asc);

create index if not exists task_attachments_task_id_idx
  on public.task_attachments (task_id, created_at desc);

create or replace function public.is_task_member(target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tasks
    where id = target_task_id
      and public.is_board_member(board_id)
  );
$$;

create or replace function public.is_task_active(target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tasks
    where id = target_task_id
      and public.is_board_active(board_id)
  );
$$;

insert into storage.buckets (id, name, public, file_size_limit)
values ('task-attachments', 'task-attachments', true, 10485760)
on conflict (id) do nothing;

alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;

drop policy if exists "members can read task comments" on public.task_comments;
create policy "members can read task comments"
on public.task_comments
for select
to authenticated
using (public.is_task_member(task_id));

drop policy if exists "members can create task comments" on public.task_comments;
create policy "members can create task comments"
on public.task_comments
for insert
to authenticated
with check (
  public.is_task_member(task_id)
  and public.is_task_active(task_id)
  and created_by = auth.uid()
);

drop policy if exists "members can read task attachments" on public.task_attachments;
create policy "members can read task attachments"
on public.task_attachments
for select
to authenticated
using (public.is_task_member(task_id));

drop policy if exists "members can create task attachments" on public.task_attachments;
create policy "members can create task attachments"
on public.task_attachments
for insert
to authenticated
with check (
  public.is_task_member(task_id)
  and public.is_task_active(task_id)
  and uploaded_by = auth.uid()
);

drop policy if exists "members can delete task attachments" on public.task_attachments;
create policy "members can delete task attachments"
on public.task_attachments
for delete
to authenticated
using (public.is_task_member(task_id) and public.is_task_active(task_id));
