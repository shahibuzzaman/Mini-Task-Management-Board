"use client";

import { useState, type FormEvent } from "react";

type CreateBoardFormProps = {
  isPending: boolean;
  onSubmit: (name: string) => Promise<void>;
};

export function CreateBoardForm({
  isPending,
  onSubmit,
}: CreateBoardFormProps) {
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return;
    }

    try {
      await onSubmit(trimmedName);
      setName("");
    } catch {
      // Parent component renders the error state.
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="board-name"
          className="block text-sm font-medium text-slate-700"
        >
          Board name
        </label>
        <input
          id="board-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Product launch board"
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          disabled={isPending}
        />
      </div>

      <button
        type="submit"
        disabled={isPending || name.trim().length < 2}
        className="w-full rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
      >
        {isPending ? "Creating..." : "Create board"}
      </button>
    </form>
  );
}
