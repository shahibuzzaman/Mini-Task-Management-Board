import type { BoardInvitation } from "@/features/boards/types/board-invitation";
import type { Database } from "@/types/database";

export type BoardInvitationRecord =
  Database["public"]["Tables"]["board_invitations"]["Row"] & {
    inviter: {
      display_name: string | null;
      email: string;
    } | null;
  };

export function mapBoardInvitationRowToBoardInvitation(
  row: BoardInvitationRecord,
): BoardInvitation {
  return {
    id: row.id,
    boardId: row.board_id,
    email: row.email,
    role: row.role,
    invitedByName:
      row.inviter?.display_name ?? row.inviter?.email ?? "Unknown inviter",
    invitedByEmail: row.inviter?.email ?? "",
    invitedUserId: row.invited_user_id,
    token: row.token,
    tokenExpiresAt: row.token_expires_at,
    lastSentAt: row.last_sent_at,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    revokedAt: row.revoked_at,
  };
}
