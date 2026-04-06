drop policy if exists "invitees can view their invitations" on public.board_invitations;

create policy "invitees can view their invitations"
on public.board_invitations
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
