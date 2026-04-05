"use client";

import { useMemo, useState } from "react";
import { AddBoardMemberForm } from "@/components/board/add-board-member-form";
import { BoardErrorState } from "@/components/board/board-error-state";
import { FeedbackNotice } from "@/components/board/feedback-notice";
import { BoardLoadingState } from "@/components/board/board-loading-state";
import { BoardMemberRow } from "@/components/board/board-member-row";
import { useAddBoardMemberMutation } from "@/features/boards/hooks/use-add-board-member-mutation";
import { useBoardMembersQuery } from "@/features/boards/hooks/use-board-members-query";
import { useRemoveBoardMemberMutation } from "@/features/boards/hooks/use-remove-board-member-mutation";
import { useUpdateBoardMemberMutation } from "@/features/boards/hooks/use-update-board-member-mutation";
import type { BoardSummary } from "@/features/boards/types/board";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardRole } from "@/types/database";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

type BoardMembersPanelProps = {
  board: BoardSummary;
  viewer: AuthViewer;
};

export function BoardMembersPanel({
  board,
  viewer,
}: BoardMembersPanelProps) {
  const membersQuery = useBoardMembersQuery(board.id);
  const addMemberMutation = useAddBoardMemberMutation(board.id);
  const updateMemberMutation = useUpdateBoardMemberMutation(board.id);
  const removeMemberMutation = useRemoveBoardMemberMutation(board.id);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const canManageMembers =
    board.currentUserRole === "owner" || board.currentUserRole === "admin";

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);

  async function handleAddMember(email: string) {
    setFeedback(null);

    try {
      await addMemberMutation.mutateAsync({ email });
      setFeedback({
        kind: "success",
        message: "Board member added.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to add the member.",
      });
      throw error;
    }
  }

  async function handleRoleChange(userId: string, role: BoardRole) {
    setFeedback(null);

    try {
      await updateMemberMutation.mutateAsync({ userId, role });
      setFeedback({
        kind: "success",
        message: "Member role updated.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update the member role.",
      });
    }
  }

  async function handleRemoveMember(userId: string) {
    setFeedback(null);

    try {
      await removeMemberMutation.mutateAsync(userId);
      setFeedback({
        kind: "success",
        message: "Board member removed.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to remove the board member.",
      });
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          Board Members
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {canManageMembers
            ? "Owners and admins can change member roles and remove access. Owners retain board ownership controls."
            : "Members can view the current board collaborators."}
        </p>
      </header>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Your access level:{" "}
        <span className="font-semibold uppercase tracking-[0.16em]">
          {board.currentUserRole}
        </span>
      </div>

      {feedback ? (
        <div className="mt-5">
          <FeedbackNotice
            kind={feedback.kind}
            message={feedback.message}
            onDismiss={() => setFeedback(null)}
          />
        </div>
      ) : null}

      {canManageMembers ? (
        <div className="mt-5">
          <AddBoardMemberForm
            isPending={addMemberMutation.isPending}
            onSubmit={handleAddMember}
          />
        </div>
      ) : null}

      <div className="mt-5">
        {membersQuery.isLoading ? (
          <BoardLoadingState />
        ) : membersQuery.isError ? (
          <BoardErrorState message={membersQuery.error.message} />
        ) : (
          <ul className="space-y-3">
            {members.map((member) => (
              <BoardMemberRow
                key={member.userId}
                member={member}
                canManageMembers={canManageMembers}
                isUpdating={
                  updateMemberMutation.isPending &&
                  updateMemberMutation.variables?.userId === member.userId
                }
                isRemoving={
                  removeMemberMutation.isPending &&
                  removeMemberMutation.variables === member.userId
                }
                onRoleChange={(role) => handleRoleChange(member.userId, role)}
                onRemove={() => handleRemoveMember(member.userId)}
              />
            ))}
          </ul>
        )}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Signed in as {viewer.displayName}. Membership changes are enforced by
        authenticated route handlers and database policies.
      </p>
    </section>
  );
}
