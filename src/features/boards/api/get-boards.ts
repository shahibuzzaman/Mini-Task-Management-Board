import { requestJson } from "@/lib/query/request-json";
import type { BoardSummary } from "@/features/boards/types/board";

export async function getBoards(): Promise<BoardSummary[]> {
  return requestJson<BoardSummary[]>("/api/boards");
}
