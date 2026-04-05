import { requestJson } from "@/lib/query/request-json";
import type { BoardSummary } from "@/features/boards/types/board";

export type CreateBoardInput = {
  name: string;
};

export async function createBoard(input: CreateBoardInput): Promise<BoardSummary> {
  return requestJson<BoardSummary>("/api/boards", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
