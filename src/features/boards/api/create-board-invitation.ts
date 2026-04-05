import { requestJson } from "@/lib/query/request-json";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";
import type { BoardRole } from "@/types/database";

export type CreateBoardInvitationInput = {
  boardId: string;
  email: string;
  role: Extract<BoardRole, "admin" | "member">;
};

export async function createBoardInvitation(
  input: CreateBoardInvitationInput,
): Promise<BoardInvitation> {
  return requestJson<BoardInvitation>("/api/board-invitations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
