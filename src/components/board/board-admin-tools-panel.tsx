"use client";

import { useMemo } from "react";
import { BoardErrorState } from "@/components/board/board-error-state";
import { BoardLoadingState } from "@/components/board/board-loading-state";
import { useBoardInvitationsQuery } from "@/features/boards/hooks/use-board-invitations-query";
import { useBoardMembersQuery } from "@/features/boards/hooks/use-board-members-query";
import {
  canInviteToBoard,
  getBoardRoleCapabilities,
  canReviewAllInvitations,
} from "@/features/boards/lib/board-permissions";
import type { BoardSummary } from "@/features/boards/types/board";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks-query";

type BoardAdminToolsPanelProps = {
  board: BoardSummary;
};

export function BoardAdminToolsPanel({ board }: BoardAdminToolsPanelProps) {
  const membersQuery = useBoardMembersQuery(board.id);
  const canAccessInvitations = canInviteToBoard(board);
  const invitationsQuery = useBoardInvitationsQuery(board.id, canAccessInvitations);
  const tasksQuery = useTasksQuery(board.id);

  const taskCount = tasksQuery.data?.length ?? 0;
  const pendingInvitationCount = useMemo(
    () =>
      (invitationsQuery.data ?? []).filter(
        (invitation) =>
          invitation.acceptedAt === null && invitation.revokedAt === null,
      ).length,
    [invitationsQuery.data],
  );
  const capabilities = getBoardRoleCapabilities(board, board.currentUserRole);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          Admin Tools
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Board-scoped metrics and the active permission model for this workspace.
        </p>
      </header>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Members"
          value={
            membersQuery.isLoading
              ? "..."
              : membersQuery.isError
                ? "!"
                : String(membersQuery.data?.length ?? 0)
          }
        />
        <MetricCard
          label="Pending invites"
          value={
            !canAccessInvitations
              ? "0"
              : invitationsQuery.isLoading
              ? "..."
              : invitationsQuery.isError
                ? "!"
                : String(pendingInvitationCount)
          }
        />
        <MetricCard
          label="Tasks"
          value={tasksQuery.isLoading ? "..." : tasksQuery.isError ? "!" : String(taskCount)}
        />
      </div>

      <div className="mt-5 space-y-3">
        {membersQuery.isError ? (
          <BoardErrorState message={membersQuery.error.message} />
        ) : invitationsQuery.isError ? (
          <BoardErrorState message={invitationsQuery.error.message} />
        ) : tasksQuery.isError ? (
          <BoardErrorState message={tasksQuery.error.message} />
        ) : membersQuery.isLoading || invitationsQuery.isLoading || tasksQuery.isLoading ? (
          <BoardLoadingState />
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-slate-950">Current board policy</p>
              <p className="mt-2">
                Invite policy:{" "}
                <span className="font-medium text-slate-950">
                  {board.invitePolicy === "members"
                    ? "Members can invite collaborators"
                    : "Only owners and admins can invite"}
                </span>
              </p>
              <p className="mt-1">
                Default invite role:{" "}
                <span className="font-medium uppercase tracking-[0.16em] text-slate-950">
                  {board.defaultInviteRole}
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
              <p className="font-semibold text-slate-950">Your capabilities</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>{capabilities.canEditTasks ? "Can edit tasks" : "Task board is read-only"}</li>
                <li>
                  {capabilities.canCreateInvitations
                    ? "Can send invitation emails"
                    : "Cannot send invitations"}
                </li>
                <li>
                  {capabilities.canManageMembers
                    ? "Can change member access"
                    : "Cannot change member access"}
                </li>
                <li>
                  {capabilities.canEditBoardSettings
                    ? "Can edit board settings"
                    : "Cannot edit board settings"}
                </li>
                <li>
                  {capabilities.canTransferOwnership
                    ? "Can transfer ownership"
                    : "Cannot transfer ownership"}
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-xs leading-5 text-slate-500">
              {!canAccessInvitations
                ? "Invitation review is limited to owners and admins on this board."
                : canReviewAllInvitations(board.currentUserRole)
                ? "Owners and admins can review every pending invitation. Members only see the invitations they created when member invites are enabled."
                : "Member invitation access is scoped to invitations you create for this board."}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}
