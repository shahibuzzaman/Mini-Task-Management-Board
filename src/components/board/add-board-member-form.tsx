"use client";

import { useState } from "react";

type AddBoardMemberFormProps = {
  isPending: boolean;
  onSubmit: (email: string) => Promise<void>;
};

export function AddBoardMemberForm({
  isPending,
  onSubmit,
}: AddBoardMemberFormProps) {
  const [email, setEmail] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await onSubmit(email);
      setEmail("");
    } catch {
      // The parent component surfaces the error feedback.
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-slate-800">
        Add member by email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="teammate@example.com"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
      </label>

      <button
        type="submit"
        disabled={isPending || email.trim().length === 0}
        className="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isPending ? "Adding..." : "Add member"}
      </button>
    </form>
  );
}
