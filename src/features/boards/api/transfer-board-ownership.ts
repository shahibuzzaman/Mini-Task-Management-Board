import { requestJson } from "@/lib/query/request-json";
import type { BoardSummary } from "@/features/boards/types/board";

export type TransferBoardOwnershipInput = {
  boardId: string;
  targetUserId: string;
};

export async function transferBoardOwnership(
  input: TransferBoardOwnershipInput,
): Promise<BoardSummary> {
  return requestJson<BoardSummary>(`/api/boards/${input.boardId}/transfer`, {
    method: "POST",
    body: JSON.stringify({
      targetUserId: input.targetUserId,
    }),
  });
}
