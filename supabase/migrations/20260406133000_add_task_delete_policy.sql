drop policy if exists "members can delete tasks" on public.tasks;
create policy "members can delete tasks"
on public.tasks
for delete
to authenticated
using (
  public.is_board_member(board_id)
  and public.is_board_active(board_id)
);
