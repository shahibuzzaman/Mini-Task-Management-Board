"use client";

import { useMemo, useState } from "react";
import { BoardTabs } from "@/components/board/board-tabs";
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
      const result = await createInvitationMutation.mutateAsync({
        email: inviteEmail.trim(),
        role: canReviewInvitations ? inviteRole : board.defaultInviteRole,
      });
      setInviteEmail("");
      setInviteRole(board.defaultInviteRole);
      showToast(
        "success",
        result.type === "member_added"
          ? "Member added to the board."
          : "Invitation sent.",
      );
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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
      <header className="max-w-3xl">
        <h1 className="text-[24px] font-bold text-slate-900">
          {board.name}
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Manage member access, invite collaborators, and monitor pending onboarding.
        </p>
      </header>

      <div className="mt-5">
        <BoardTabs boardId={board.id} activeTab="members" />
      </div>
      <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-surface-container-lowest shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <form
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_10rem_10rem]"
            onSubmit={handleInviteSubmit}
          >
            <label className="relative block">
              <span className="sr-only">Invite email</span>
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
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
                className="w-full rounded-xl border border-transparent bg-surface-container-low py-3.5 pl-14 pr-4 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
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
              className="rounded-xl border border-transparent bg-surface-container-low px-4 py-3.5 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>

            <button
              type="submit"
              disabled={!canInviteMembers || inviteEmail.trim().length === 0}
              className="rounded-xl bg-primary px-6 py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
            >
              {createInvitationMutation.isPending ? "Sending..." : "Send Invite"}
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] border-collapse sm:min-w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="bg-surface-container-lowest px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d]">
                  User
                </th>
                <th className="bg-surface-container-lowest px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d]">
                  Role
                </th>
                <th className="bg-surface-container-lowest px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d]">
                  Access Level
                </th>
                <th className="bg-surface-container-lowest px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.userId} className="border-b border-slate-100 last:border-b-0 hover:bg-surface-container-low/50 transition">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-sm text-[15px] font-bold text-white">
                        {getInitials(member.displayName)}
                      </span>
                      <div>
                        <p className="text-[15px] font-bold text-slate-800">
                          {member.displayName}
                        </p>
                        <p className="mt-0.5 text-[13px] font-medium text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${getRolePillClassName(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-[14px] text-slate-600">
                    {getAccessLabel(member.role)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3">
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
                            className="rounded-lg border border-transparent bg-surface-container-low px-3 py-2.5 text-[13px] font-bold text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
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
                            className="rounded-lg px-3 py-2.5 text-[13px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </>
                      ) : member.isCurrentUser ? (
                        <span className="rounded-lg bg-surface-container-high px-4 py-2 text-[13px] font-bold text-primary">
                          You
                        </span>
                      ) : (
                        <span className="text-slate-300">
                          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                            <circle cx="5" cy="12" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="19" cy="12" r="1.5" />
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

      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-bold text-slate-800">
            Pending Invitations
          </h2>
          <span className="rounded-full border border-cyan-100 bg-cyan-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-cyan-700">
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
    <article className="rounded-[1.5rem] border border-transparent bg-surface-container-lowest p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] transition hover:border-[#cfc9ff]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high text-primary shadow-sm">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M20 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8l8 5 8-5Z" />
            <path d="M20 6H4l8 5 8-5Z" />
          </svg>
        </div>
        <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-amber-700">
          {formatSentAt(invitation.lastSentAt)}
        </span>
      </div>
      <p className="mt-6 text-[16px] font-bold text-slate-800">{invitation.email}</p>
      <p className="mt-2 text-[14px] text-slate-500">
        Invited as{" "}
        <span className="font-bold text-primary">
          {invitation.role === "member" ? "Member" : "Admin"}
        </span>
      </p>
      <div className="mt-8 flex items-center justify-between gap-4 text-[14px] font-bold">
        {canManage ? (
          <>
            <button
              type="button"
              onClick={onRevoke}
              disabled={isUpdating || isRemoving}
              className="text-slate-400 transition hover:text-rose-600 disabled:opacity-50"
            >
              Revoke
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={isUpdating || isRemoving}
              className="rounded-xl bg-surface-container-high px-5 py-2.5 text-primary transition hover:bg-[#d5dcf5] disabled:opacity-50"
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
              className="rounded-xl bg-surface-container-high px-5 py-2.5 text-primary transition hover:bg-[#d5dcf5]"
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
    <article className="flex min-h-[18rem] flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[#cfc9ff] bg-[#f8f6ff] p-6 text-center transition hover:bg-[#f0edff]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-[#e4e1fa]">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4" />
          <path d="m15.4 6.5-6.8 4" />
        </svg>
      </div>
      <h3 className="mt-6 text-[18px] font-bold text-slate-800">
        Share Invite Link
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
        Quickly onboard multiple people via a secure link.
      </p>
      <button
        type="button"
        onClick={() => void handleCopy(board.id)}
        className="mt-6 text-[13px] font-bold uppercase tracking-[0.14em] text-primary transition hover:text-primary/80"
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
