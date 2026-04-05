import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapBoardInvitationRowToBoardInvitation,
  type BoardInvitationRecord,
} from "@/features/boards/lib/map-board-invitation-row";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";
import type { Database } from "@/types/database";

const BOARD_INVITATIONS_SELECT = `
  id,
  board_id,
  email,
  role,
  invited_by,
  invited_user_id,
  created_at,
  accepted_at,
  revoked_at,
  inviter:profiles!board_invitations_invited_by_fkey(display_name, email)
`;

export async function getBoardInvitations(
  supabase: SupabaseClient<Database>,
  boardId: string,
): Promise<BoardInvitation[]> {
  const { data, error } = await supabase
    .from("board_invitations")
    .select(BOARD_INVITATIONS_SELECT)
    .eq("board_id", boardId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as BoardInvitationRecord[]).map(
    mapBoardInvitationRowToBoardInvitation,
  );
}
