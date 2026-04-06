"use client";

import { useMemo } from "react";
import { AddBoardMemberForm } from "@/components/board/add-board-member-form";
import { BoardErrorState } from "@/components/board/board-error-state";
import { BoardListLoadingState } from "@/components/board/board-loading-state";
import { BoardMemberRow } from "@/components/board/board-member-row";
import { useAddBoardMemberMutation } from "@/features/boards/hooks/use-add-board-member-mutation";
import { useBoardMembersQuery } from "@/features/boards/hooks/use-board-members-query";
import { useRemoveBoardMemberMutation } from "@/features/boards/hooks/use-remove-board-member-mutation";
import { useUpdateBoardMemberMutation } from "@/features/boards/hooks/use-update-board-member-mutation";
import type { BoardSummary } from "@/features/boards/types/board";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardRole } from "@/types/database";
import { useToast } from "@/store/use-toast";

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
  const showToast = useToast();
  const canManageMembers =
    board.currentUserRole === "owner" || board.currentUserRole === "admin";

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);

  async function handleAddMember(email: string) {
    try {
      await addMemberMutation.mutateAsync({ email });
      showToast("success", "Board member added.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to add the member.",
      );
      throw error;
    }
  }

  async function handleRoleChange(userId: string, role: BoardRole) {
    try {
      await updateMemberMutation.mutateAsync({ userId, role });
      showToast("success", "Member role updated.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to update the member role.",
      );
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await removeMemberMutation.mutateAsync(userId);
      showToast("success", "Board member removed.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to remove the board member.",
      );
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
          <BoardListLoadingState />
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
