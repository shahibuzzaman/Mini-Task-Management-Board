"use client";

import { PinnedBoardCard } from "@/features/dashboard/components/pinned-board-card";
import type { BoardSummary } from "@/features/boards/types/board";

type PinnedBoardsSectionProps = {
  boards: BoardSummary[];
  onCreateBoard: () => void;
};

export function PinnedBoardsSection({
  boards,
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
        <h2 className="text-[18px] font-bold text-slate-900">Pinned Boards</h2>
      </div>
      {boards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-[14px] leading-6 text-slate-600">
          Pin boards from each board&apos;s settings page to show them here.
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {boards.map((board, index) => (
          <PinnedBoardCard key={board.id} board={board} index={index} />
        ))}

        <button
          onClick={onCreateBoard}
          className="group relative flex h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e2e8f0] bg-[#f8faff] p-5 transition-all hover:border-[#cbd5e1] hover:bg-[#f1f5f9] sm:p-6"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-800 shadow-sm transition-transform group-hover:scale-110">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
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
