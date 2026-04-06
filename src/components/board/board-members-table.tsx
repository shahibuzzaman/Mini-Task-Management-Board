"use client";

import {
  getAccessLabel,
  getMemberInitials,
  getRolePillClassName,
} from "@/components/board/board-members-utils";
import type { BoardMember } from "@/features/boards/types/board-member";
import type { BoardRole } from "@/types/database";

type BoardMembersTableProps = {
  members: BoardMember[];
  canManageMembers: boolean;
  isMutating: boolean;
  onRoleChange: (userId: string, role: BoardRole) => void;
  onRemoveMember: (userId: string) => void;
};

export function BoardMembersTable({
  members,
  canManageMembers,
  isMutating,
  onRoleChange,
  onRemoveMember,
}: BoardMembersTableProps) {
  return (
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
            <tr
              key={member.userId}
              className="border-b border-slate-100 last:border-b-0 hover:bg-surface-container-low/50 transition"
            >
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-sm text-[15px] font-bold text-white">
                    {getMemberInitials(member.displayName)}
                  </span>
                  <div>
                    <p className="text-[15px] font-bold text-slate-800">
                      {member.displayName}
                    </p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-500">
                      {member.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <span
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${getRolePillClassName(member.role)}`}
                >
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
                        disabled={isMutating}
                        onChange={(event) =>
                          onRoleChange(member.userId, event.target.value as BoardRole)
                        }
                        className="rounded-lg border border-transparent bg-surface-container-low px-3 py-2.5 text-[13px] font-bold text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member.userId)}
                        disabled={isMutating}
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
  );
}
