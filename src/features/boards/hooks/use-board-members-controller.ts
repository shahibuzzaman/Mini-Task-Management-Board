"use client";

import { useState } from "react";
import { useCreateBoardInvitationMutation } from "@/features/boards/hooks/use-create-board-invitation-mutation";
import { useBoardMembersQuery } from "@/features/boards/hooks/use-board-members-query";
import { useRemoveBoardMemberMutation } from "@/features/boards/hooks/use-remove-board-member-mutation";
import { useUpdateBoardMemberMutation } from "@/features/boards/hooks/use-update-board-member-mutation";
import {
  canInviteToBoard,
  canManageBoardMembers,
  canReviewAllInvitations,
} from "@/features/boards/lib/board-permissions";
import type { BoardRole } from "@/types/database";
import type { BoardSummary } from "@/features/boards/types/board";
import { useToast } from "@/store/use-toast";

type UseBoardMembersControllerOptions = {
  board: BoardSummary;
};

export function useBoardMembersController({
  board,
}: UseBoardMembersControllerOptions) {
  const membersQuery = useBoardMembersQuery(board.id);
  const updateMemberMutation = useUpdateBoardMemberMutation(board.id);
  const removeMemberMutation = useRemoveBoardMemberMutation(board.id);
  const createInvitationMutation = useCreateBoardInvitationMutation(board.id);
  const showToast = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">(
    board.defaultInviteRole,
  );
  const [invitationSentEmail, setInvitationSentEmail] = useState<string | null>(null);

  const canManageMembers = canManageBoardMembers(board.currentUserRole);
  const canInviteMembers = canInviteToBoard(board);
  const canReviewInvitations = canReviewAllInvitations(board.currentUserRole);
  const members = membersQuery.data ?? [];

  async function submitInvite() {
    if (!canInviteMembers || inviteEmail.trim().length === 0) {
      return;
    }

    try {
      const normalizedEmail = inviteEmail.trim().toLowerCase();
      const result = await createInvitationMutation.mutateAsync({
        email: normalizedEmail,
        role: canReviewInvitations ? inviteRole : board.defaultInviteRole,
      });
      setInviteEmail("");
      setInviteRole(board.defaultInviteRole);

      if (result.type === "member_added") {
        showToast("success", "Member added to the board.");
        return;
      }

      setInvitationSentEmail(normalizedEmail);
      showToast("success", "Invitation email sent.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to send invitation.",
      );
    }
  }

  async function handleRoleChange(userId: string, role: BoardRole) {
    try {
      await updateMemberMutation.mutateAsync({ userId, role });
      showToast("success", "Member role updated.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to update member role.",
      );
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await removeMemberMutation.mutateAsync(userId);
      showToast("success", "Member removed.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to remove member.",
      );
    }
  }

  function closeInvitationSentModal() {
    setInvitationSentEmail(null);
  }

  return {
    board,
    members,
    inviteEmail,
    inviteRole,
    invitationSentEmail,
    canManageMembers,
    canInviteMembers,
    canReviewInvitations,
    isCreatingInvitation: createInvitationMutation.isPending,
    isMutatingMembers:
      updateMemberMutation.isPending || removeMemberMutation.isPending,
    setInviteEmail,
    setInviteRole,
    submitInvite,
    handleRoleChange,
    handleRemoveMember,
    closeInvitationSentModal,
  };
}
