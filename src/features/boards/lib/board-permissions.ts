import type { BoardSummary } from "@/features/boards/types/board";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";
import type { BoardRole } from "@/types/database";

export function canManageBoardSettings(role: BoardRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageBoardLifecycle(role: BoardRole): boolean {
  return role === "owner";
}

export function canManageBoardMembers(role: BoardRole): boolean {
  return role === "owner" || role === "admin";
}

export function canInviteToBoard(
  board: Pick<BoardSummary, "invitePolicy" | "currentUserRole">,
): boolean {
  return (
    board.currentUserRole === "owner" ||
    board.currentUserRole === "admin" ||
    (board.currentUserRole === "member" && board.invitePolicy === "members")
  );
}

export function canReviewAllInvitations(role: BoardRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageInvitation(
  board: Pick<BoardSummary, "currentUserRole">,
  invitation: Pick<BoardInvitation, "invitedByEmail" | "acceptedAt" | "revokedAt">,
  viewerEmail: string,
): boolean {
  if (invitation.acceptedAt || invitation.revokedAt) {
    return false;
  }

  if (canReviewAllInvitations(board.currentUserRole)) {
    return true;
  }

  return invitation.invitedByEmail.toLowerCase() === viewerEmail.toLowerCase();
}

export function getBoardRoleCapabilities(board: BoardSummary, role: BoardRole) {
  return {
    canEditTasks: !board.archivedAt,
    canCreateInvitations:
      role === "owner" ||
      role === "admin" ||
      (role === "member" && board.invitePolicy === "members"),
    canManageInvitationRoles: role === "owner" || role === "admin",
    canManageMembers: role === "owner" || role === "admin",
    canEditBoardSettings: role === "owner" || role === "admin",
    canArchiveBoard: role === "owner",
    canDeleteBoard: role === "owner",
    canTransferOwnership: role === "owner",
  };
}
