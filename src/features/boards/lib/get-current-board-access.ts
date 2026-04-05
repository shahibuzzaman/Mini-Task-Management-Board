import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getAccessibleBoards } from "@/features/boards/lib/get-accessible-boards";
import type { BoardSummary } from "@/features/boards/types/board";

export async function getCurrentBoardAccess(
  supabase: SupabaseClient<Database>,
  userId: string,
  boardId: string,
): Promise<BoardSummary> {
  const boards = await getAccessibleBoards(supabase, userId);
  const board = boards.find((candidate) => candidate.id === boardId);

  if (!board) {
    throw new Error("Board not found or access is not allowed.");
  }

  return board;
}
