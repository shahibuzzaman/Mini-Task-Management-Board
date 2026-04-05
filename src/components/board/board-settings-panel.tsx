"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FeedbackNotice } from "@/components/board/feedback-notice";
import { useUpdateBoardMutation } from "@/features/boards/hooks/use-update-board-mutation";
import type { BoardSummary } from "@/features/boards/types/board";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

type BoardSettingsPanelProps = {
  board: BoardSummary;
};

export function BoardSettingsPanel({ board }: BoardSettingsPanelProps) {
  const router = useRouter();
  const updateBoardMutation = useUpdateBoardMutation();
  const [name, setName] = useState(board.name);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  if (board.currentUserRole !== "owner") {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    try {
      await updateBoardMutation.mutateAsync({
        boardId: board.id,
        name,
      });
      setFeedback({
        kind: "success",
        message: "Board settings updated.",
      });
      router.refresh();
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to update board settings.",
      });
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          Board Settings
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Owners can rename the board and manage collaboration from here.
        </p>
      </header>

      {feedback ? (
        <div className="mt-5">
          <FeedbackNotice
            kind={feedback.kind}
            message={feedback.message}
            onDismiss={() => setFeedback(null)}
          />
        </div>
      ) : null}

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor={`board-settings-name-${board.id}`}
            className="block text-sm font-medium text-slate-700"
          >
            Board name
          </label>
          <input
            id={`board-settings-name-${board.id}`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            disabled={updateBoardMutation.isPending}
          />
        </div>

        <button
          type="submit"
          disabled={updateBoardMutation.isPending || name.trim().length < 2}
          className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
        >
          {updateBoardMutation.isPending ? "Saving..." : "Save board settings"}
        </button>
      </form>
    </section>
  );
}
