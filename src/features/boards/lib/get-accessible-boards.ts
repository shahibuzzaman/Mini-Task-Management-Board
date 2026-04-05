import type { SupabaseClient } from "@supabase/supabase-js";
import type { BoardSummary } from "@/features/boards/types/board";
import type { Database } from "@/types/database";

type MembershipRow = {
  board_id: string;
  role: BoardSummary["currentUserRole"];
};

type BoardRow = {
  id: string;
  name: string;
  created_at: string;
};

export async function getAccessibleBoards(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<BoardSummary[]> {
  const [{ data: memberships, error: membershipsError }, { data: boards, error: boardsError }] =
    await Promise.all([
      supabase
        .from("board_members")
        .select("board_id, role")
        .eq("user_id", userId)
        .returns<MembershipRow[]>(),
      supabase
        .from("boards")
        .select("id, name, created_at")
        .order("created_at", { ascending: true })
        .returns<BoardRow[]>(),
    ]);

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  if (boardsError) {
    throw new Error(boardsError.message);
  }

  const roleByBoardId = new Map(
    memberships.map((membership) => [membership.board_id, membership.role]),
  );

  return boards
    .filter((board) => roleByBoardId.has(board.id))
    .map((board) => ({
      id: board.id,
      name: board.name,
      currentUserRole: roleByBoardId.get(board.id) ?? "member",
    }));
}
