"use client";

import Link from "next/link";
import { getBoardPath } from "@/features/boards/lib/board-routes";
import type { BoardSummary } from "@/features/boards/types/board";

type PinnedBoardCardProps = {
  board: BoardSummary;
  index: number;
};

export function PinnedBoardCard({ board, index }: PinnedBoardCardProps) {
  const isPrimaryCard = index === 0;

  return (
    <Link
      href={getBoardPath(board.id)}
      className="group relative flex h-[220px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#3525cd]/30 hover:shadow-md sm:p-6"
    >
      <div
        className={`absolute bottom-0 left-0 top-0 w-1 ${
          isPrimaryCard ? "bg-[#3525cd]" : "bg-cyan-500"
        }`}
      />

      <div className="mb-4 flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isPrimaryCard
              ? "bg-[#3525cd]/10 text-[#3525cd]"
              : "bg-cyan-500/10 text-cyan-600"
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 3.82-13 1.5 1.5 0 0 0-2.18-2.18 22 22 0 0 1 13-3.82l3 3" />
            <path d="m9 11 4 4" />
          </svg>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
          Pinned
        </span>
      </div>

      <h3 className="truncate text-[17px] font-bold tracking-tight text-slate-900">
        {board.name}
      </h3>
      <div className="mt-1 mb-4 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Last updated {isPrimaryCard ? "2h" : "5h"} ago
      </div>

      <div className="mb-auto flex items-center gap-2">
        <span
          className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${
            isPrimaryCard
              ? "bg-cyan-100 text-cyan-800"
              : "bg-teal-100 text-teal-800"
          }`}
        >
          {isPrimaryCard ? "4 Active Tasks" : "12 Active Tasks"}
        </span>
        {isPrimaryCard ? (
          <span className="rounded-md bg-red-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-red-800">
            2 Overdue
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="-space-x-1.5 flex items-center">
          {[1, 2].map((avatarIndex) => (
            <div
              key={avatarIndex}
              className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-white bg-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.pravatar.cc/100?img=${avatarIndex + 20 + index}`}
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          {index === 1 ? (
            <span className="ml-3 shrink-0 text-[11px] font-bold text-slate-500">
              +2
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
          </svg>
          {isPrimaryCard ? "68%" : "32%"}
        </div>
      </div>
    </Link>
  );
}
