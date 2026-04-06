import { requestJson } from "@/lib/query/request-json";
import type { BoardMember } from "@/features/boards/types/board-member";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";
import type { BoardRole } from "@/types/database";

export type CreateBoardInvitationInput = {
  boardId: string;
  email: string;
  role: Extract<BoardRole, "admin" | "member">;
};

export type CreateBoardInvitationResult =
  | {
      type: "member_added";
      member: BoardMember;
    }
  | {
      type: "invitation_sent";
      invitation: BoardInvitation;
    };

export async function createBoardInvitation(
  input: CreateBoardInvitationInput,
): Promise<CreateBoardInvitationResult> {
  return requestJson<CreateBoardInvitationResult>("/api/board-invitations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
