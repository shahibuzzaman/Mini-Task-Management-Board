"use client";

import type { BoardRole } from "@/types/database";
import type { BoardMember } from "@/features/boards/types/board-member";

type BoardMemberRowProps = {
  member: BoardMember;
  canManageMembers: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  onRoleChange: (role: BoardRole) => Promise<void>;
  onRemove: () => Promise<void>;
};

export function BoardMemberRow({
  member,
  canManageMembers,
  isUpdating,
  isRemoving,
  onRoleChange,
  onRemove,
}: BoardMemberRowProps) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {member.displayName}
            {member.isCurrentUser ? (
              <span className="ml-2 text-xs font-medium uppercase tracking-[0.16em] text-sky-700">
                You
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-slate-600">{member.email}</p>
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-700">
          {member.role}
        </span>
      </div>

      {canManageMembers ? (
        <div className="mt-4 flex flex-col gap-3">
          <label className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Role
            <select
              value={member.role}
              disabled={isUpdating || isRemoving}
              onChange={(event) => void onRoleChange(event.target.value as BoardRole)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              <option value="owner">Owner</option>
              <option value="member">Member</option>
            </select>
          </label>

          <button
            type="button"
            disabled={isUpdating || isRemoving}
            onClick={() => void onRemove()}
            className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            {isRemoving ? "Removing..." : "Remove member"}
          </button>
        </div>
      ) : null}
    </li>
  );
}
