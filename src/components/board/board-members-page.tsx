"use client";

import { useMemo, useState } from "react";
import { BoardTabs } from "@/components/board/board-tabs";
import { useAddBoardMemberMutation } from "@/features/boards/hooks/use-add-board-member-mutation";
import { useBoardInvitationsQuery } from "@/features/boards/hooks/use-board-invitations-query";
import { useBoardMembersQuery } from "@/features/boards/hooks/use-board-members-query";
import { useCreateBoardInvitationMutation } from "@/features/boards/hooks/use-create-board-invitation-mutation";
import { useRemoveBoardInvitationMutation } from "@/features/boards/hooks/use-remove-board-invitation-mutation";
import { useRemoveBoardMemberMutation } from "@/features/boards/hooks/use-remove-board-member-mutation";
import { useUpdateBoardInvitationMutation } from "@/features/boards/hooks/use-update-board-invitation-mutation";
import { useUpdateBoardMemberMutation } from "@/features/boards/hooks/use-update-board-member-mutation";
import {
  canInviteToBoard,
  canManageBoardMembers,
  canManageInvitation,
  canReviewAllInvitations,
} from "@/features/boards/lib/board-permissions";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";
import type { BoardRole } from "@/types/database";
import { useToast } from "@/store/use-toast";

type BoardMembersPageProps = {
  board: BoardSummary;
  viewer: AuthViewer;
};

export function BoardMembersPage({ board, viewer }: BoardMembersPageProps) {
  const membersQuery = useBoardMembersQuery(board.id);
  const invitationsQuery = useBoardInvitationsQuery(
    board.id,
    canInviteToBoard(board),
  );
  const addMemberMutation = useAddBoardMemberMutation(board.id);
  const updateMemberMutation = useUpdateBoardMemberMutation(board.id);
  const removeMemberMutation = useRemoveBoardMemberMutation(board.id);
  const createInvitationMutation = useCreateBoardInvitationMutation(board.id);
  const updateInvitationMutation = useUpdateBoardInvitationMutation(board.id);
  const removeInvitationMutation = useRemoveBoardInvitationMutation(board.id);
  const showToast = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">(
    board.defaultInviteRole,
  );
  const canManageMembers = canManageBoardMembers(board.currentUserRole);
  const canInviteMembers = canInviteToBoard(board);
  const canReviewInvitations = canReviewAllInvitations(board.currentUserRole);

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const invitations = useMemo(
    () =>
      (invitationsQuery.data ?? []).filter(
        (invitation) =>
          invitation.acceptedAt === null && invitation.revokedAt === null,
      ),
    [invitationsQuery.data],
  );

  async function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canInviteMembers || inviteEmail.trim().length === 0) {
      return;
    }

    try {
      await createInvitationMutation.mutateAsync({
        email: inviteEmail.trim(),
        role: canReviewInvitations ? inviteRole : board.defaultInviteRole,
      });
      setInviteEmail("");
      setInviteRole(board.defaultInviteRole);
      showToast("success", "Invitation sent.");
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

  async function handleResendInvitation(invitationId: string) {
    try {
      await updateInvitationMutation.mutateAsync({
        invitationId,
        action: "resend",
      });
      showToast("success", "Invitation resent.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to resend invitation.",
      );
    }
  }

  async function handleRevokeInvitation(invitationId: string) {
    try {
      await removeInvitationMutation.mutateAsync(invitationId);
      showToast("success", "Invitation revoked.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to revoke invitation.",
      );
    }
  }

  async function handleCopyInviteLink(token: string) {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(inviteUrl);
    showToast("success", "Invite link copied.");
  }

  async function handleAddDirectMember(email: string) {
    try {
      await addMemberMutation.mutateAsync({ email });
      showToast("success", "Member added directly.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to add member.",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          {board.name}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Manage member access, invite collaborators, and monitor pending onboarding.
        </p>
      </header>

      <div className="mt-8">
        <BoardTabs boardId={board.id} activeTab="members" />
      </div>
      <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <form
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_10rem_10rem]"
            onSubmit={handleInviteSubmit}
          >
            <label className="relative block">
              <span className="sr-only">Invite email</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </span>
              <input
                type="email"
                autoComplete="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="Enter colleague's email address..."
                disabled={!canInviteMembers || createInvitationMutation.isPending}
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </label>

            <select
              value={canReviewInvitations ? inviteRole : board.defaultInviteRole}
              onChange={(event) =>
                setInviteRole(event.target.value as "admin" | "member")
              }
              disabled={
                !canInviteMembers ||
                !canReviewInvitations ||
                createInvitationMutation.isPending
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={!canInviteMembers || inviteEmail.trim().length === 0}
              className="rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {createInvitationMutation.isPending ? "Sending..." : "Send Invite"}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  User
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Role
                </th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Access Level
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                        {getInitials(member.displayName)}
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-slate-800">
                          {member.displayName}
                        </p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getRolePillClassName(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-600">
                    {getAccessLabel(member.role)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-4">
                      {canManageMembers && member.role !== "owner" ? (
                        <>
                          <select
                            value={member.role}
                            disabled={
                              updateMemberMutation.isPending ||
                              removeMemberMutation.isPending
                            }
                            onChange={(event) =>
                              void handleRoleChange(
                                member.userId,
                                event.target.value as BoardRole,
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/15"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => void handleRemoveMember(member.userId)}
                            disabled={
                              updateMemberMutation.isPending ||
                              removeMemberMutation.isPending
                            }
                            className="text-sm font-semibold text-[#4f46e5] transition hover:text-[#4338ca]"
                          >
                            Manage
                          </button>
                        </>
                      ) : member.isCurrentUser ? (
                        <span className="text-sm font-semibold text-[#4f46e5]">
                          You
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                            <circle cx="5" cy="12" r="1.75" />
                            <circle cx="12" cy="12" r="1.75" />
                            <circle cx="19" cy="12" r="1.75" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-center border-t border-slate-200 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z" />
            </svg>
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-slate-800">
            Need to bulk import?
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            You can upload a CSV file to invite up to 100 members at once to
            this board workspace.
          </p>
          <button
            type="button"
            onClick={() => void handleAddDirectMember(inviteEmail.trim())}
            disabled
            className="mt-4 text-sm font-semibold text-[#4f46e5]"
          >
            Download CSV Template
          </button>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Pending Invitations
          </h2>
          <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase text-cyan-700">
            {invitations.length} pending
          </span>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          {invitations.map((invitation) => (
            <PendingInvitationCard
              key={invitation.id}
              invitation={invitation}
              canManage={canManageInvitation(board, invitation, viewer.email)}
              isUpdating={
                updateInvitationMutation.isPending &&
                updateInvitationMutation.variables?.invitationId === invitation.id
              }
              isRemoving={
                removeInvitationMutation.isPending &&
                removeInvitationMutation.variables === invitation.id
              }
              onCopyLink={() => void handleCopyInviteLink(invitation.token)}
              onResend={() => void handleResendInvitation(invitation.id)}
              onRevoke={() => void handleRevokeInvitation(invitation.id)}
            />
          ))}

          <ShareInviteCard board={board} />
        </div>
      </section>
    </div>
  );
}

function PendingInvitationCard({
  invitation,
  canManage,
  isUpdating,
  isRemoving,
  onCopyLink,
  onResend,
  onRevoke,
}: {
  invitation: BoardInvitation;
  canManage: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  onCopyLink: () => void;
  onResend: () => void;
  onRevoke: () => void;
}) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-[#f7f8ff] p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#4f46e5] shadow-sm">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M20 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8l8 5 8-5Z" />
            <path d="M20 6H4l8 5 8-5Z" />
          </svg>
        </div>
        <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
          {formatSentAt(invitation.lastSentAt)}
        </span>
      </div>
      <p className="mt-6 text-xl font-semibold text-slate-800">{invitation.email}</p>
      <p className="mt-2 text-sm text-slate-500">
        Invited as{" "}
        <span className="font-semibold text-[#4f46e5]">
          {invitation.role === "member" ? "Member" : "Admin"}
        </span>
      </p>
      <div className="mt-8 flex items-center justify-between gap-4 text-sm font-semibold">
        {canManage ? (
          <>
            <button
              type="button"
              onClick={onRevoke}
              disabled={isUpdating || isRemoving}
              className="text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
            >
              Revoke
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={isUpdating || isRemoving}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[#4f46e5] shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              Resend
            </button>
          </>
        ) : (
          <>
            <span className="text-slate-400">Pending</span>
            <button
              type="button"
              onClick={onCopyLink}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[#4f46e5] shadow-sm transition hover:bg-slate-50"
            >
              Copy Link
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function ShareInviteCard({ board }: { board: BoardSummary }) {
  async function handleCopy(boardId: string) {
    await navigator.clipboard.writeText(
      `${window.location.origin}/boards/${boardId}/members`,
    );
  }

  return (
    <article className="flex min-h-[18rem] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#cfc9ff] bg-[#f8f6ff] p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#4f46e5] shadow-sm">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4" />
          <path d="m15.4 6.5-6.8 4" />
        </svg>
      </div>
      <h3 className="mt-6 text-2xl font-semibold text-slate-800">
        Share Invite Link
      </h3>
      <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
        Quickly onboard multiple people via a secure link.
      </p>
      <button
        type="button"
        onClick={() => void handleCopy(board.id)}
        className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-[#4f46e5]"
      >
        Copy Link
      </button>
    </article>
  );
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

function getRolePillClassName(role: BoardRole) {
  switch (role) {
    case "owner":
      return "bg-violet-100 text-violet-700";
    case "admin":
      return "bg-sky-100 text-sky-700";
    case "member":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getAccessLabel(role: BoardRole) {
  switch (role) {
    case "owner":
      return "Full System Control";
    case "admin":
      return "Organization Management";
    case "member":
    default:
      return "Standard Access";
  }
}

function formatSentAt(value: string) {
  const diffInHours = Math.max(
    1,
    Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60)),
  );

  return diffInHours < 24 ? `Sent ${diffInHours}h ago` : "Sent recently";
}
