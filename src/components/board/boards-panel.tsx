"use client";

import Link from "next/link";
import { useBoardsQuery } from "@/features/boards/hooks/use-boards-query";
import { getBoardPath } from "@/features/boards/lib/board-routes";
import { getBoardTheme } from "@/features/boards/lib/board-theme";
import type { BoardSummary } from "@/features/boards/types/board";
import { useUIStore } from "@/store/ui-store-provider";

type BoardsPanelProps = {
  boards: BoardSummary[];
  activeBoardId: string | null;
};

export function BoardsPanel({ boards, activeBoardId }: BoardsPanelProps) {
  const boardsQuery = useBoardsQuery(boards);
  const boardList = boardsQuery.data ?? boards;
  const openCreateBoardModal = useUIStore((state) => state.openCreateBoardModal);

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
      <div className="mt-5 space-y-3">
        {boardList.length > 0 ? (
          boardList.map((board) => {
            const isActive = board.id === activeBoardId;
            const theme = getBoardTheme(board.accentColor);

            return (
              <Link
                key={board.id}
                href={getBoardPath(board.id)}
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
                      {board.isPinned ? " · pinned" : ""}
                      {board.archivedAt ? " · archived" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${theme.badgeClassName}`}
                      >
                        Active
                      </span>
                    ) : null}
                  </div>
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
        <button
          type="button"
          onClick={openCreateBoardModal}
          className="w-full rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
        >
          Create board
        </button>
      </div>
    </section>
  );
}
