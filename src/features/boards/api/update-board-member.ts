import { requestJson } from "@/lib/query/request-json";
import type { BoardMember } from "@/features/boards/types/board-member";
import type { Database } from "@/types/database";

export type UpdateBoardMemberInput = {
  userId: string;
  role: Database["public"]["Tables"]["board_members"]["Row"]["role"];
};

export async function updateBoardMember(
  input: UpdateBoardMemberInput,
): Promise<BoardMember> {
  return requestJson<BoardMember>(`/api/board-members/${input.userId}`, {
    method: "PATCH",
    body: JSON.stringify({
      role: input.role,
    }),
  });
}
