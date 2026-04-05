"use client";

import { useState } from "react";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";
import type { BoardRole } from "@/types/database";

type BoardInvitationRowProps = {
  invitation: BoardInvitation;
  canChangeRole: boolean;
  canManageInvitation: boolean;
  invitePath: string;
  isUpdating: boolean;
  isRemoving: boolean;
  onRoleChange: (role: Extract<BoardRole, "admin" | "member">) => Promise<void>;
  onResend: () => Promise<void>;
  onRevoke: () => Promise<void>;
};

export function BoardInvitationRow({
  invitation,
  canChangeRole,
  canManageInvitation,
  invitePath,
  isUpdating,
  isRemoving,
  onRoleChange,
  onResend,
  onRevoke,
}: BoardInvitationRowProps) {
  const isPending = invitation.acceptedAt === null && invitation.revokedAt === null;
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  async function handleCopyLink() {
    const inviteUrl = `${window.location.origin}${invitePath}`;

    await navigator.clipboard.writeText(inviteUrl);
    setCopyMessage("Invite link copied.");
    window.setTimeout(() => setCopyMessage(null), 2000);
  }

  return (
    <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">{invitation.email}</p>
          <p className="mt-1 text-sm text-slate-600">
            Invited by {invitation.invitedByName}
          </p>
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-700">
          {invitation.role}
        </span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {isPending
          ? `Pending acceptance. Last sent ${new Date(
              invitation.lastSentAt,
            ).toLocaleString()}.`
          : "Invitation completed"}
      </p>

      {copyMessage ? (
        <p className="mt-3 text-xs font-medium text-emerald-700">{copyMessage}</p>
      ) : null}

      {isPending ? (
        <div className="mt-4 flex flex-col gap-3">
          {canChangeRole ? (
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Invite role
              <select
                value={invitation.role}
                disabled={isUpdating || isRemoving}
                onChange={(event) =>
                  void onRoleChange(
                    event.target.value as Extract<BoardRole, "admin" | "member">,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            >
              Copy link
            </button>
            {canManageInvitation ? (
              <button
                type="button"
                disabled={isUpdating || isRemoving}
                onClick={() => void onResend()}
                className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                Resend
              </button>
            ) : null}
            {canManageInvitation ? (
              <button
                type="button"
                disabled={isUpdating || isRemoving}
                onClick={() => void onRevoke()}
                className="flex-1 rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                Revoke
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}
