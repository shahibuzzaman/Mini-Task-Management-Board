import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthViewer } from "@/features/auth/types/viewer";
import {
  mapBoardMemberRowToBoardMember,
  type BoardMemberRecord,
} from "@/features/boards/lib/map-board-member-row";
import type { BoardMember } from "@/features/boards/types/board-member";
import type { Database } from "@/types/database";

const BOARD_MEMBERS_SELECT = `
  board_id,
  user_id,
  role,
  created_at,
  profile:profiles!board_members_user_id_fkey(display_name, email)
`;

export async function getBoardMembers(
  supabase: SupabaseClient<Database>,
  boardId: string,
  viewer: Pick<AuthViewer, "id">,
): Promise<BoardMember[]> {
  const { data, error } = await supabase
    .from("board_members")
    .select(BOARD_MEMBERS_SELECT)
    .eq("board_id", boardId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as BoardMemberRecord[]).map((member) =>
    mapBoardMemberRowToBoardMember(member, viewer),
  );
}
