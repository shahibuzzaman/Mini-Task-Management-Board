import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { ensureCurrentUserSharedBoard } from "@/features/boards/lib/ensure-current-user-shared-board";
import type { BoardSummary } from "@/features/boards/types/board";

type BoardMemberRoleRow = {
  role: BoardSummary["currentUserRole"];
};

type BoardRow = {
  id: string;
  name: string;
};

export async function getCurrentBoardAccess(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<BoardSummary> {
  const boardId = await ensureCurrentUserSharedBoard(supabase);

  const [{ data: board, error: boardError }, { data: membership, error: membershipError }] =
    await Promise.all([
      supabase
        .from("boards")
        .select("id, name")
        .eq("id", boardId)
        .single<BoardRow>(),
      supabase
        .from("board_members")
        .select("role")
        .eq("board_id", boardId)
        .eq("user_id", userId)
        .single<BoardMemberRoleRow>(),
    ]);

  if (boardError) {
    throw new Error(boardError.message);
  }

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  return {
    id: board.id,
    name: board.name,
    currentUserRole: membership.role,
  };
}
