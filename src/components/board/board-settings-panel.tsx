"use client";

import { BoardErrorState } from "@/components/board/board-error-state";
import { BoardTransferOwnershipLoadingState } from "@/components/board/board-loading-state";
import { useBoardSettingsController } from "@/features/boards/hooks/use-board-settings-controller";
import type { BoardSummary } from "@/features/boards/types/board";
import type {
  BoardAccentColor,
  BoardInvitePolicy,
  BoardInviteRole,
} from "@/types/database";

type BoardSettingsPanelProps = {
  board: BoardSummary;
};

export function BoardSettingsPanel({ board }: BoardSettingsPanelProps) {
  const {
    accentColor,
    canEditSettings,
    canManageLifecycle,
    canRemoveBoard,
    defaultInviteRole,
    deleteBoardMutation,
    description,
    handleArchiveToggle,
    handleDeleteBoard,
    handleSave,
    handleTransferOwnership,
    invitePolicy,
    membersQuery,
    name,
    setAccentColor,
    setDefaultInviteRole,
    setDescription,
    setInvitePolicy,
    setName,
    setTargetOwnerId,
    targetOwnerId,
    transferOwnershipMutation,
    transferableMembers,
    updateBoardMutation,
  } = useBoardSettingsController(board);

  if (!canEditSettings) {
    return null;
  }

  const labelClass = "block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d] mb-2";
  const inputClass = "block w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3.5 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary";

  return (
    <section className="rounded-[1.5rem] bg-surface-container-lowest p-8 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]">
      <header>
        <h2 className={labelClass}>
          Board Settings
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
          {board.currentUserRole === "owner"
            ? "Owners can tune collaboration policy, lifecycle controls, and ownership."
            : "Admins can update collaboration settings while owners retain destructive controls."}
        </p>
      </header>
      <form
        className="mt-8 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <div>
          <label
            htmlFor={`board-settings-name-${board.id}`}
            className={labelClass}
          >
            Board name
          </label>
          <input
            id={`board-settings-name-${board.id}`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            disabled={updateBoardMutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor={`board-settings-description-${board.id}`}
            className={labelClass}
          >
            Description
          </label>
          <textarea
            id={`board-settings-description-${board.id}`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className={inputClass}
            disabled={updateBoardMutation.isPending}
          />
        </div>

        <div>
          <label
            htmlFor={`board-settings-accent-${board.id}`}
            className={labelClass}
          >
            Accent color
          </label>
          <select
            id={`board-settings-accent-${board.id}`}
            value={accentColor}
            onChange={(event) =>
              setAccentColor(event.target.value as BoardAccentColor)
            }
            className={inputClass}
            disabled={updateBoardMutation.isPending}
          >
            <option value="sky">Sky</option>
            <option value="emerald">Emerald</option>
            <option value="amber">Amber</option>
            <option value="rose">Rose</option>
            <option value="slate">Slate</option>
          </select>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`board-settings-invite-policy-${board.id}`}
              className={labelClass}
            >
              Invite policy
            </label>
            <select
              id={`board-settings-invite-policy-${board.id}`}
              value={invitePolicy}
              onChange={(event) =>
                setInvitePolicy(event.target.value as BoardInvitePolicy)
              }
              className={inputClass}
              disabled={updateBoardMutation.isPending}
            >
              <option value="admins_only">Owners and admins only</option>
              <option value="members">Members can invite too</option>
            </select>
          </div>

          <div>
            <label
              htmlFor={`board-settings-default-invite-role-${board.id}`}
              className={labelClass}
            >
              Default invite role
            </label>
            <select
              id={`board-settings-default-invite-role-${board.id}`}
              value={defaultInviteRole}
              onChange={(event) =>
                setDefaultInviteRole(event.target.value as BoardInviteRole)
              }
              className={inputClass}
              disabled={updateBoardMutation.isPending}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <p className="rounded-xl border border-transparent bg-surface-container-low px-5 py-4 text-[13px] leading-relaxed text-slate-600">
          Members can always collaborate on tasks. Invite policy decides whether
          members can send new invitations, and member-created invites use the
          default invite role.
        </p>

        <button
          type="submit"
          disabled={updateBoardMutation.isPending || name.trim().length < 2}
          className="rounded-xl bg-primary px-6 py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
        >
          {updateBoardMutation.isPending ? "Saving..." : "Save Board Settings"}
        </button>
      </form>

      {canManageLifecycle || canRemoveBoard ? (
        <>
          {canManageLifecycle ? (
            <div className="mt-10 border-t border-slate-100 pt-8">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <h3 className={labelClass}>
                    Archive
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                    Archived boards remain visible but become read-only for task changes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleArchiveToggle()}
                  disabled={updateBoardMutation.isPending}
                  className="shrink-0 rounded-xl bg-surface-container-high px-6 py-3.5 text-[14px] font-bold text-slate-700 transition hover:bg-[#d5dcf5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {board.archivedAt ? "Unarchive board" : "Archive board"}
                </button>
              </div>
            </div>
          ) : null}

          {canManageLifecycle ? (
            <div className="mt-10 border-t border-slate-100 pt-8">
              <h3 className={labelClass}>
                Transfer ownership
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                Promote another collaborator to owner. You will become an admin.
              </p>

              <div className="mt-6">
                {membersQuery.isLoading ? (
                  <BoardTransferOwnershipLoadingState />
                ) : membersQuery.isError ? (
                  <BoardErrorState message={membersQuery.error.message} />
                ) : transferableMembers.length > 0 ? (
                  <div className="space-y-4">
                    <select
                      value={targetOwnerId}
                      onChange={(event) => setTargetOwnerId(event.target.value)}
                      className={inputClass}
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
                      className="rounded-xl bg-primary px-6 py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
                    >
                      {transferOwnershipMutation.isPending
                        ? "Transferring..."
                        : "Transfer Ownership"}
                    </button>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 px-5 py-6 text-[14px] leading-relaxed text-slate-600">
                    Add another member before transferring ownership.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {canRemoveBoard ? (
            <div className="mt-10 border-t border-slate-100 pt-8">
              <h3 className="block text-[11px] font-bold uppercase tracking-[0.12em] text-rose-600 mb-2">
                Danger zone
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                Deleting a board permanently removes its tasks, members, and invitations.
              </p>
              <button
                type="button"
                onClick={() => void handleDeleteBoard()}
                disabled={deleteBoardMutation.isPending}
                className="mt-6 rounded-xl bg-rose-600 px-6 py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-600/50"
              >
                {deleteBoardMutation.isPending ? "Deleting..." : "Delete Board"}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
