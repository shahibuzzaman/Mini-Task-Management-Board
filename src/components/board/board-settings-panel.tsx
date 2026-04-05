"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { BoardErrorState } from "@/components/board/board-error-state";
import { BoardLoadingState } from "@/components/board/board-loading-state";
import { FeedbackNotice } from "@/components/board/feedback-notice";
import { useBoardMembersQuery } from "@/features/boards/hooks/use-board-members-query";
import {
  canManageBoardLifecycle,
  canManageBoardSettings,
} from "@/features/boards/lib/board-permissions";
import { useDeleteBoardMutation } from "@/features/boards/hooks/use-delete-board-mutation";
import { useTransferBoardOwnershipMutation } from "@/features/boards/hooks/use-transfer-board-ownership-mutation";
import { useUpdateBoardMutation } from "@/features/boards/hooks/use-update-board-mutation";
import type { BoardSummary } from "@/features/boards/types/board";
import type {
  BoardAccentColor,
  BoardInvitePolicy,
  BoardInviteRole,
} from "@/types/database";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

type BoardSettingsPanelProps = {
  board: BoardSummary;
};

export function BoardSettingsPanel({ board }: BoardSettingsPanelProps) {
  const router = useRouter();
  const membersQuery = useBoardMembersQuery(board.id);
  const updateBoardMutation = useUpdateBoardMutation();
  const transferOwnershipMutation = useTransferBoardOwnershipMutation();
  const deleteBoardMutation = useDeleteBoardMutation();
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description);
  const [accentColor, setAccentColor] = useState<BoardAccentColor>(
    board.accentColor,
  );
  const [invitePolicy, setInvitePolicy] = useState<BoardInvitePolicy>(
    board.invitePolicy,
  );
  const [defaultInviteRole, setDefaultInviteRole] = useState<BoardInviteRole>(
    board.defaultInviteRole,
  );
  const [targetOwnerId, setTargetOwnerId] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const canEditSettings = canManageBoardSettings(board.currentUserRole);
  const canManageLifecycle = canManageBoardLifecycle(board.currentUserRole);

  if (!canEditSettings) {
    return null;
  }

  const transferableMembers = (membersQuery.data ?? []).filter(
    (member) => !member.isCurrentUser,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    try {
      await updateBoardMutation.mutateAsync({
        boardId: board.id,
        name,
        description,
        accentColor,
        invitePolicy,
        defaultInviteRole,
      });
      setFeedback({
        kind: "success",
        message: "Board settings updated.",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update board settings.",
      });
    }
  }

  async function handleArchiveToggle() {
    setFeedback(null);

    try {
      await updateBoardMutation.mutateAsync({
        boardId: board.id,
        name,
        description,
        accentColor,
        invitePolicy,
        defaultInviteRole,
        archivedAt: board.archivedAt ? null : new Date().toISOString(),
      });
      setFeedback({
        kind: "success",
        message: board.archivedAt
          ? "Board unarchived."
          : "Board archived successfully.",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update board archive state.",
      });
    }
  }

  async function handleTransferOwnership() {
    if (targetOwnerId.length === 0) {
      return;
    }

    setFeedback(null);

    try {
      await transferOwnershipMutation.mutateAsync({
        boardId: board.id,
        targetUserId: targetOwnerId,
      });
      setFeedback({
        kind: "success",
        message: "Board ownership transferred.",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to transfer ownership.",
      });
    }
  }

  async function handleDeleteBoard() {
    const confirmed = window.confirm(
      "Delete this board? This will permanently remove its tasks, members, and invitations.",
    );

    if (!confirmed) {
      return;
    }

    setFeedback(null);

    try {
      await deleteBoardMutation.mutateAsync(board.id);
      router.replace("/board");
      router.refresh();
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to delete the board.",
      });
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          Board Settings
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {board.currentUserRole === "owner"
            ? "Owners can tune collaboration policy, lifecycle controls, and ownership."
            : "Admins can update collaboration settings while owners retain destructive controls."}
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

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor={`board-settings-name-${board.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Board name
          </label>
          <input
            id={`board-settings-name-${board.id}`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            disabled={updateBoardMutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor={`board-settings-description-${board.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id={`board-settings-description-${board.id}`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            disabled={updateBoardMutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor={`board-settings-accent-${board.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Accent color
          </label>
          <select
            id={`board-settings-accent-${board.id}`}
            value={accentColor}
            onChange={(event) =>
              setAccentColor(event.target.value as BoardAccentColor)
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            disabled={updateBoardMutation.isPending}
          >
            <option value="sky">Sky</option>
            <option value="emerald">Emerald</option>
            <option value="amber">Amber</option>
            <option value="rose">Rose</option>
            <option value="slate">Slate</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`board-settings-invite-policy-${board.id}`}
              className="block text-sm font-medium text-slate-700"
            >
              Invite policy
            </label>
            <select
              id={`board-settings-invite-policy-${board.id}`}
              value={invitePolicy}
              onChange={(event) =>
                setInvitePolicy(event.target.value as BoardInvitePolicy)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              disabled={updateBoardMutation.isPending}
            >
              <option value="admins_only">Owners and admins only</option>
              <option value="members">Members can invite too</option>
            </select>
          </div>

          <div>
            <label
              htmlFor={`board-settings-default-invite-role-${board.id}`}
              className="block text-sm font-medium text-slate-700"
            >
              Default invite role
            </label>
            <select
              id={`board-settings-default-invite-role-${board.id}`}
              value={defaultInviteRole}
              onChange={(event) =>
                setDefaultInviteRole(event.target.value as BoardInviteRole)
              }
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              disabled={updateBoardMutation.isPending}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
          Members can always collaborate on tasks. Invite policy decides whether
          members can send new invitations, and member-created invites use the
          default invite role.
        </p>

        <button
          type="submit"
          disabled={updateBoardMutation.isPending || name.trim().length < 2}
          className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
        >
          {updateBoardMutation.isPending ? "Saving..." : "Save board settings"}
        </button>
      </form>

      {canManageLifecycle ? (
        <>
          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Archive
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Archived boards remain visible but become read-only for task changes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleArchiveToggle()}
                disabled={updateBoardMutation.isPending}
                className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                {board.archivedAt ? "Unarchive board" : "Archive board"}
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
              Transfer ownership
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Promote another collaborator to owner. You will become an admin.
            </p>

            <div className="mt-4">
              {membersQuery.isLoading ? (
                <BoardLoadingState />
              ) : membersQuery.isError ? (
                <BoardErrorState message={membersQuery.error.message} />
              ) : transferableMembers.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={targetOwnerId}
                    onChange={(event) => setTargetOwnerId(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Select a new owner</option>
                    {transferableMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.displayName} ({member.role})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void handleTransferOwnership()}
                    disabled={
                      transferOwnershipMutation.isPending || targetOwnerId.length === 0
                    }
                    className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  >
                    {transferOwnershipMutation.isPending
                      ? "Transferring..."
                      : "Transfer ownership"}
                  </button>
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                  Add another member before transferring ownership.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
              Danger zone
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Deleting a board permanently removes its tasks, members, and invitations.
            </p>
            <button
              type="button"
              onClick={() => void handleDeleteBoard()}
              disabled={deleteBoardMutation.isPending}
              className="mt-4 rounded-full border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              {deleteBoardMutation.isPending ? "Deleting..." : "Delete board"}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
