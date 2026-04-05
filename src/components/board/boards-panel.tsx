"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateBoardForm } from "@/components/board/create-board-form";
import { FeedbackNotice } from "@/components/board/feedback-notice";
import { useBoardsQuery } from "@/features/boards/hooks/use-boards-query";
import { getBoardTheme } from "@/features/boards/lib/board-theme";
import { useCreateBoardMutation } from "@/features/boards/hooks/use-create-board-mutation";
import type { BoardSummary } from "@/features/boards/types/board";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

type BoardsPanelProps = {
  boards: BoardSummary[];
  activeBoardId: string | null;
};

export function BoardsPanel({ boards, activeBoardId }: BoardsPanelProps) {
  const router = useRouter();
  const boardsQuery = useBoardsQuery(boards);
  const createBoardMutation = useCreateBoardMutation();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const boardList = boardsQuery.data ?? boards;

  async function handleCreateBoard(name: string) {
    setFeedback(null);

    try {
      const board = await createBoardMutation.mutateAsync({ name });
      setFeedback({
        kind: "success",
        message: "Board created successfully.",
      });
      router.replace(`/board?boardId=${board.id}`);
      router.refresh();
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to create the board.",
      });
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <header>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
          Boards
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create a board, switch between boards, and manage access per board.
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

      <div className="mt-5 space-y-3">
        {boardList.length > 0 ? (
          boardList.map((board) => {
            const isActive = board.id === activeBoardId;
            const theme = getBoardTheme(board.accentColor);

            return (
              <Link
                key={board.id}
                href={`/board?boardId=${board.id}`}
                className={[
                  "block rounded-2xl border px-4 py-3 transition",
                  isActive
                    ? theme.badgeClassName
                    : "border-slate-200 bg-slate-50 hover:bg-white",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {board.name}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                      {board.currentUserRole}
                      {board.archivedAt ? " · archived" : ""}
                    </p>
                  </div>
                  {isActive ? (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${theme.badgeClassName}`}
                    >
                      Active
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
            No boards yet. Create your first board to start collaborating.
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-5">
        <CreateBoardForm
          isPending={createBoardMutation.isPending}
          onSubmit={handleCreateBoard}
        />
      </div>
    </section>
  );
}
