"use client";

import { formatInvitationSentAt } from "@/components/board/board-members-utils";
import type { BoardSummary } from "@/features/boards/types/board";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";

type BoardPendingInvitationsProps = {
  board: BoardSummary;
  invitations: BoardInvitation[];
  canManageInvitation: (invitation: BoardInvitation) => boolean;
  isUpdatingInvitation: (invitationId: string) => boolean;
  isRemovingInvitation: (invitationId: string) => boolean;
  onCopyInviteLink: (token: string) => void;
  onResendInvitation: (invitationId: string) => void;
  onRevokeInvitation: (invitationId: string) => void;
};

export function BoardPendingInvitations({
  board,
  invitations,
  canManageInvitation,
  isUpdatingInvitation,
  isRemovingInvitation,
  onCopyInviteLink,
  onResendInvitation,
  onRevokeInvitation,
}: BoardPendingInvitationsProps) {
  return (
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
            canManage={canManageInvitation(invitation)}
            isUpdating={isUpdatingInvitation(invitation.id)}
            isRemoving={isRemovingInvitation(invitation.id)}
            onCopyLink={() => onCopyInviteLink(invitation.token)}
            onResend={() => onResendInvitation(invitation.id)}
            onRevoke={() => onRevokeInvitation(invitation.id)}
          />
        ))}

        <ShareInviteCard board={board} />
      </div>
    </section>
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
          {formatInvitationSentAt(invitation.lastSentAt)}
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
