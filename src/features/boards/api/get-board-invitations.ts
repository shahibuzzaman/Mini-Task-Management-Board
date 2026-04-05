import { requestJson } from "@/lib/query/request-json";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";

export async function getBoardInvitations(
  boardId: string,
): Promise<BoardInvitation[]> {
  return requestJson<BoardInvitation[]>(
    `/api/board-invitations?boardId=${boardId}`,
  );
}
