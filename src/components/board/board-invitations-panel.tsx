"use client";

import { useMemo } from "react";
import { BoardErrorState } from "@/components/board/board-error-state";
import { BoardInvitationRow } from "@/components/board/board-invitation-row";
import { BoardListLoadingState } from "@/components/board/board-loading-state";
import { InviteBoardMemberForm } from "@/components/board/invite-board-member-form";
import { useBoardInvitationsQuery } from "@/features/boards/hooks/use-board-invitations-query";
import { useCreateBoardInvitationMutation } from "@/features/boards/hooks/use-create-board-invitation-mutation";
import { useRemoveBoardInvitationMutation } from "@/features/boards/hooks/use-remove-board-invitation-mutation";
import { useUpdateBoardInvitationMutation } from "@/features/boards/hooks/use-update-board-invitation-mutation";
import {
  canInviteToBoard,
  canManageInvitation,
  canReviewAllInvitations,
} from "@/features/boards/lib/board-permissions";
import type { BoardSummary } from "@/features/boards/types/board";
import { useToast } from "@/store/use-toast";

type BoardInvitationsPanelProps = {
  board: BoardSummary;
  viewerEmail: string;
};

export function BoardInvitationsPanel({
  board,
  viewerEmail,
}: BoardInvitationsPanelProps) {
  const invitationsQuery = useBoardInvitationsQuery(board.id);
  const createInvitationMutation = useCreateBoardInvitationMutation(board.id);
  const updateInvitationMutation = useUpdateBoardInvitationMutation(board.id);
  const removeInvitationMutation = useRemoveBoardInvitationMutation(board.id);
  const showToast = useToast();
  const canAccessInvitations = canInviteToBoard(board);
  const canReviewInvitations = canReviewAllInvitations(board.currentUserRole);

  const invitations = useMemo(
    () => invitationsQuery.data ?? [],
    [invitationsQuery.data],
  );

  if (!canAccessInvitations) {
    return null;
  }

  async function handleInvite(input: {
    email: string;
    role: "admin" | "member";
  }) {
    try {
      const result = await createInvitationMutation.mutateAsync(input);
      showToast(
        "success",
        result.type === "member_added"
          ? "Registered user added directly to the board."
          : "Invitation email sent.",
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to send invitation.",
      );
      throw error;
    }
  }

  async function handleRoleChange(invitationId: string, role: "admin" | "member") {
    try {
      await updateInvitationMutation.mutateAsync({ invitationId, role });
      showToast("success", "Invitation role updated.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to update invitation role.",
      );
    }
  }

  async function handleResend(invitationId: string) {
    try {
      await updateInvitationMutation.mutateAsync({
        invitationId,
        action: "resend",
      });
      showToast("success", "Invitation email resent.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to resend invitation.",
      );
    }
  }

  async function handleRevoke(invitationId: string) {
    try {
      await removeInvitationMutation.mutateAsync(invitationId);
      showToast("success", "Invitation revoked.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to revoke invitation.",
      );
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          Invitations
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {canReviewInvitations
            ? "Send invite emails, copy invite links, and manage pending invitations."
            : "Send invite emails and track the invitations you created."}
        </p>
      </header>
      <div className="mt-5">
        <InviteBoardMemberForm
          isPending={createInvitationMutation.isPending}
          canChooseRole={canReviewInvitations}
          defaultRole={board.defaultInviteRole}
          onSubmit={handleInvite}
        />
      </div>

      {!canReviewInvitations ? (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-xs leading-5 text-slate-600">
          Member-created invites inherit the board default role of{" "}
          <span className="font-semibold uppercase tracking-[0.16em] text-slate-950">
            {board.defaultInviteRole}
          </span>
          .
        </p>
      ) : null}

      <div className="mt-5">
        {invitationsQuery.isLoading ? (
          <BoardListLoadingState />
        ) : invitationsQuery.isError ? (
          <BoardErrorState message={invitationsQuery.error.message} />
        ) : invitations.length > 0 ? (
          <ul className="space-y-3">
            {invitations.map((invitation) => (
              <BoardInvitationRow
                key={invitation.id}
                invitation={invitation}
                canChangeRole={canReviewInvitations}
                canManageInvitation={canManageInvitation(
                  board,
                  invitation,
                  viewerEmail,
                )}
                invitePath={`/invite/${invitation.token}`}
                isUpdating={
                  updateInvitationMutation.isPending &&
                  updateInvitationMutation.variables?.invitationId === invitation.id
                }
                isRemoving={
                  removeInvitationMutation.isPending &&
                  removeInvitationMutation.variables === invitation.id
                }
                onRoleChange={(role) =>
                  handleRoleChange(invitation.id, role)
                }
                onResend={() => handleResend(invitation.id)}
                onRevoke={() => handleRevoke(invitation.id)}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
            No pending invitations for this board.
          </p>
        )}
      </div>
    </section>
  );
}
