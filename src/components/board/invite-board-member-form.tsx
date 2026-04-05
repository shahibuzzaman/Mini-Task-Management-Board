"use client";

import { useState } from "react";
import type { BoardRole } from "@/types/database";

type InviteBoardMemberFormProps = {
  isPending: boolean;
  onSubmit: (input: {
    email: string;
    role: Extract<BoardRole, "admin" | "member">;
  }) => Promise<void>;
};

export function InviteBoardMemberForm({
  isPending,
  onSubmit,
}: InviteBoardMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Extract<BoardRole, "admin" | "member">>(
    "member",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await onSubmit({
        email,
        role,
      });
      setEmail("");
      setRole("member");
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
