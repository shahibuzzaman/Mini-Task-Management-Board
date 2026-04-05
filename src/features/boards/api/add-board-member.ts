import { requestJson } from "@/lib/query/request-json";
import type { BoardMember } from "@/features/boards/types/board-member";

export type AddBoardMemberInput = {
  boardId: string;
  email: string;
};

export async function addBoardMember(
  input: AddBoardMemberInput,
): Promise<BoardMember> {
  return requestJson<BoardMember>("/api/board-members", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
