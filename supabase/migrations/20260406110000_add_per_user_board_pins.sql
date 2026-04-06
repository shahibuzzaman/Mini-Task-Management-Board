create table if not exists public.board_pins (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (board_id, user_id)
);

create index if not exists board_pins_user_id_idx
  on public.board_pins (user_id, created_at desc);

alter table public.board_pins enable row level security;

drop policy if exists "users can manage their board pins" on public.board_pins;
create policy "users can manage their board pins"
on public.board_pins
for all
to authenticated
using (
  user_id = auth.uid()
  and public.is_board_member(board_id)
)
with check (
  user_id = auth.uid()
  and public.is_board_member(board_id)
);
