"use client";

import { useState } from "react";
import type { BoardRole } from "@/types/database";

type InviteBoardMemberFormProps = {
  isPending: boolean;
  canChooseRole?: boolean;
  defaultRole?: Extract<BoardRole, "admin" | "member">;
  onSubmit: (input: {
    email: string;
    role: Extract<BoardRole, "admin" | "member">;
  }) => Promise<void>;
};

export function InviteBoardMemberForm({
  isPending,
  canChooseRole = true,
  defaultRole = "member",
  onSubmit,
}: InviteBoardMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Extract<BoardRole, "admin" | "member">>(
    defaultRole,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await onSubmit({
        email,
        role,
      });
      setEmail("");
      setRole(defaultRole);
    } catch {
      // Parent renders feedback.
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-slate-800">
        Invite by email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="teammate@example.com"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
      </label>

      {canChooseRole ? (
        <label className="block text-sm font-medium text-slate-800">
          Invite as
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as Extract<BoardRole, "admin" | "member">)
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-xs leading-5 text-slate-600">
          New collaborators will be invited as{" "}
          <span className="font-semibold uppercase tracking-[0.16em] text-slate-950">
            {defaultRole}
          </span>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || email.trim().length === 0}
        className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isPending ? "Sending invite..." : "Send invitation"}
      </button>
    </form>
  );
}
