import { requestJson } from "@/lib/query/request-json";
import type { BoardSummary } from "@/features/boards/types/board";

export type UpdateBoardInput = {
  boardId: string;
  name: string;
  description: string;
  archivedAt?: string | null;
};

export async function updateBoard(
  input: UpdateBoardInput,
): Promise<BoardSummary> {
  return requestJson<BoardSummary>(`/api/boards/${input.boardId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      archivedAt: input.archivedAt,
    }),
  });
}
