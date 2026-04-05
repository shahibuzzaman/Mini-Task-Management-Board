"use client";

import { useMemo, useState } from "react";
import { BoardErrorState } from "@/components/board/board-error-state";
import { BoardInvitationRow } from "@/components/board/board-invitation-row";
import { BoardLoadingState } from "@/components/board/board-loading-state";
import { FeedbackNotice } from "@/components/board/feedback-notice";
import { InviteBoardMemberForm } from "@/components/board/invite-board-member-form";
import { useBoardInvitationsQuery } from "@/features/boards/hooks/use-board-invitations-query";
import { useCreateBoardInvitationMutation } from "@/features/boards/hooks/use-create-board-invitation-mutation";
import { useRemoveBoardInvitationMutation } from "@/features/boards/hooks/use-remove-board-invitation-mutation";
import { useUpdateBoardInvitationMutation } from "@/features/boards/hooks/use-update-board-invitation-mutation";
import type { BoardSummary } from "@/features/boards/types/board";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

type BoardInvitationsPanelProps = {
  board: BoardSummary;
};

export function BoardInvitationsPanel({ board }: BoardInvitationsPanelProps) {
  const invitationsQuery = useBoardInvitationsQuery(board.id);
  const createInvitationMutation = useCreateBoardInvitationMutation(board.id);
  const updateInvitationMutation = useUpdateBoardInvitationMutation(board.id);
  const removeInvitationMutation = useRemoveBoardInvitationMutation(board.id);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const canManageInvitations =
    board.currentUserRole === "owner" || board.currentUserRole === "admin";

  const invitations = useMemo(
    () => invitationsQuery.data ?? [],
    [invitationsQuery.data],
  );

  if (!canManageInvitations) {
    return null;
  }

  async function handleInvite(input: {
    email: string;
    role: "admin" | "member";
  }) {
    setFeedback(null);

    try {
      await createInvitationMutation.mutateAsync(input);
      setFeedback({
        kind: "success",
        message: "Invitation email sent.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to send invitation.",
      });
      throw error;
    }
  }

  async function handleRoleChange(invitationId: string, role: "admin" | "member") {
    setFeedback(null);

    try {
      await updateInvitationMutation.mutateAsync({ invitationId, role });
      setFeedback({
        kind: "success",
        message: "Invitation role updated.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update invitation role.",
      });
    }
  }

  async function handleResend(invitationId: string) {
    setFeedback(null);

    try {
      await updateInvitationMutation.mutateAsync({
        invitationId,
        action: "resend",
      });
      setFeedback({
        kind: "success",
        message: "Invitation email resent.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to resend invitation.",
      });
    }
  }

  async function handleRevoke(invitationId: string) {
    setFeedback(null);

    try {
      await removeInvitationMutation.mutateAsync(invitationId);
      setFeedback({
        kind: "success",
        message: "Invitation revoked.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to revoke invitation.",
      });
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          Invitations
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Send invite emails to new collaborators and manage pending invitations.
        </p>
      </header>

      {feedback ? (
        <div className="mt-5">
          <FeedbackNotice
            kind={feedback.kind}
            message={feedback.message}
            onDismiss={() => setFeedback(null)}
          />
        </div>
      ) : null}

      <div className="mt-5">
        <InviteBoardMemberForm
          isPending={createInvitationMutation.isPending}
          onSubmit={handleInvite}
        />
      </div>

      <div className="mt-5">
        {invitationsQuery.isLoading ? (
          <BoardLoadingState />
        ) : invitationsQuery.isError ? (
          <BoardErrorState message={invitationsQuery.error.message} />
        ) : invitations.length > 0 ? (
          <ul className="space-y-3">
            {invitations.map((invitation) => (
              <BoardInvitationRow
                key={invitation.id}
                invitation={invitation}
                canManageInvitations={canManageInvitations}
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
