import { requestJson } from "@/lib/query/request-json";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";
import type { BoardRole } from "@/types/database";

export type UpdateBoardInvitationInput = {
  invitationId: string;
  boardId: string;
  role?: Extract<BoardRole, "admin" | "member">;
  action?: "resend";
};

export async function updateBoardInvitation(
  input: UpdateBoardInvitationInput,
): Promise<BoardInvitation> {
  return requestJson<BoardInvitation>(
    `/api/board-invitations/${input.invitationId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        boardId: input.boardId,
        role: input.role,
        action: input.action,
      }),
    },
  );
}
