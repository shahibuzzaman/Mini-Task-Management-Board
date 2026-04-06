"use client";

import { PinnedBoardCard } from "@/features/dashboard/components/pinned-board-card";
import type { BoardSummary } from "@/features/boards/types/board";

type PinnedBoardsSectionProps = {
  boards: BoardSummary[];
  title?: string;
  emptyMessage?: string;
  onCreateBoard: () => void;
};

export function PinnedBoardsSection({
  boards,
  title = "Pinned Boards",
  emptyMessage = "Pin boards from each board's settings page to show them here.",
  onCreateBoard,
}: PinnedBoardsSectionProps) {
  return (
    <div className="mb-10 sm:mb-14">
      <div className="mb-6 flex items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="#fbbf24"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <h2 className="text-[18px] font-bold text-slate-900">{title}</h2>
      </div>
      {boards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-[14px] leading-6 text-slate-600">
          {emptyMessage}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {boards.map((board, index) => (
          <PinnedBoardCard key={board.id} board={board} index={index} />
        ))}

        <button
          onClick={onCreateBoard}
          className="group relative flex h-[220px] flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[#e2e8f0] bg-surface-container-low p-6 transition-all hover:border-[#cbd5e1] hover:bg-slate-50"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#3525cd] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 transition-transform group-hover:scale-110">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <span className="text-[15px] font-bold tracking-tight text-slate-700">
            Create New Board
          </span>
        </button>
      </div>
    </div>
  );
}
