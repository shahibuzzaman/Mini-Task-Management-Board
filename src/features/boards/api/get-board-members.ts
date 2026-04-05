import { requestJson } from "@/lib/query/request-json";
import type { BoardMember } from "@/features/boards/types/board-member";

export async function getBoardMembers(): Promise<BoardMember[]> {
  return requestJson<BoardMember[]>("/api/board-members");
}
