"use client";

import { useBoardsQuery } from "@/features/boards/hooks/use-boards-query";
import type { BoardSummary } from "@/features/boards/types/board";
import { getBoardPath } from "@/features/boards/lib/board-routes";
import Link from "next/link";
import { useUIStore } from "@/store/ui-store-provider";
import type { DashboardMetrics } from "@/features/dashboard/lib/get-dashboard-metrics";

function formatMetric(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getCompletionRate(metrics: DashboardMetrics | null) {
  if (!metrics || metrics.totalTasks === 0) {
    return "0%";
  }

  return `${Math.round((metrics.completedTasks / metrics.totalTasks) * 100)}%`;
}

export function ProjectsOverview({
  boards,
  metrics,
}: {
  boards: BoardSummary[];
  metrics: DashboardMetrics | null;
}) {
  const boardsQuery = useBoardsQuery(boards);
  const boardList = boardsQuery.data ?? boards;
  const pinnedBoards = boardList.filter((board) => board.isPinned);
  const openCreateBoardModal = useUIStore((state) => state.openCreateBoardModal);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">


      {/* KPI Stats Widgets */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:mb-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {/* Widget 1: Total Tasks */}
        <div className="relative flex h-[130px] flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3525cd]"></div>
          <span className="text-[15px] font-semibold text-slate-600 pl-2 pt-1">Total Tasks</span>
          <div className="flex items-end justify-between pl-2 pb-1">
            <span className="text-[36px] font-extrabold text-slate-900 leading-none tracking-tight">
              {formatMetric(metrics?.totalTasks ?? 0)}
            </span>
            <span className="text-[13px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
              {formatMetric(boardList.length)} boards
            </span>
          </div>
        </div>

        {/* Widget 2: Completed */}
        <div className="relative flex h-[130px] flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0e5c6a]"></div>
          <span className="text-[15px] font-semibold text-slate-600 pl-2 pt-1">Completed</span>
          <div className="flex items-end justify-between pl-2 pb-1">
            <span className="text-[36px] font-extrabold text-slate-900 leading-none tracking-tight">
              {formatMetric(metrics?.completedTasks ?? 0)}
            </span>
            <span className="text-[13px] font-bold text-[#0e5c6a] flex items-center gap-1 mb-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {getCompletionRate(metrics)}
            </span>
          </div>
        </div>

        {/* Widget 3: In Progress */}
        <div className="relative flex h-[130px] flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#5e697a]"></div>
          <span className="text-[15px] font-semibold text-slate-600 pl-2 pt-1">In Progress</span>
          <div className="flex items-end justify-between pl-2 pb-1">
            <span className="text-[36px] font-extrabold text-slate-900 leading-none tracking-tight">
              {formatMetric(metrics?.inProgressTasks ?? 0)}
            </span>
            <span className="text-[13px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
              Active now
            </span>
          </div>
        </div>

        {/* Widget 4: Overdue */}
        <div className="relative flex h-[130px] flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#c82121]"></div>
          <span className="text-[15px] font-semibold text-slate-600 pl-2 pt-1">Overdue</span>
          <div className="flex items-end justify-between pl-2 pb-1">
            <span className="text-[36px] font-extrabold text-[#c82121] leading-none tracking-tight">
              {formatMetric(metrics?.overdueTasks ?? 0)}
            </span>
            <span className="text-[13px] font-extrabold text-[#c82121] flex items-center gap-1 mb-1">
              <span className="font-black text-[15px]">!</span>{" "}
              {(metrics?.overdueTasks ?? 0) > 0 ? "Needs attention" : "All clear"}
            </span>
          </div>
        </div>
      </div>

      {/* Pinned Boards */}
      <div className="mb-10 sm:mb-14">
        <div className="flex items-center gap-2 mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <h2 className="text-[18px] font-bold text-slate-900">Pinned Boards</h2>
        </div>
        {pinnedBoards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-[14px] leading-6 text-slate-600">
            Pin boards from each board&apos;s settings page to show them here.
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {pinnedBoards.map((board, index) => (
            <Link key={board.id} href={getBoardPath(board.id)} className="group relative flex h-[220px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#3525cd]/30 hover:shadow-md sm:p-6">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${index === 0 ? "bg-[#3525cd]" : "bg-cyan-500"}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${index === 0 ? "bg-[#3525cd]/10 text-[#3525cd]" : "bg-cyan-500/10 text-cyan-600"}`}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 3.82-13 1.5 1.5 0 0 0-2.18-2.18 22 22 0 0 1 13-3.82l3 3"/><path d="m9 11 4 4"/></svg>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                  Pinned
                </span>
              </div>

              <h3 className="text-[17px] font-bold text-slate-900 truncate tracking-tight">{board.name}</h3>
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 mt-1 mb-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Last updated {index === 0 ? "2h" : "5h"} ago
              </div>

              <div className="flex items-center gap-2 mb-auto">
                <span className={`px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase rounded-md ${index === 0 ? "bg-cyan-100 text-cyan-800" : "bg-teal-100 text-teal-800"}`}>{index === 0 ? "4 Active Tasks" : "12 Active Tasks"}</span>
                {index === 0 && <span className="px-2.5 py-1 text-[11px] font-extrabold tracking-wide uppercase rounded-md bg-red-100 text-red-800">2 Overdue</span>}
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                 <div className="flex items-center -space-x-1.5">
                    {[1, 2].map((i) => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://i.pravatar.cc/100?img=${i + 20 + index}`} alt="User" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {index === 1 && <span className="text-[11px] font-bold text-slate-500 ml-3 shrink-0">+2</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 text-[12px] font-bold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                    {index === 0 ? "68%" : "32%"}
                  </div>
              </div>
            </Link>
          ))}

          <button onClick={openCreateBoardModal} className="group relative flex h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e2e8f0] bg-[#f8faff] p-5 transition-all hover:border-[#cbd5e1] hover:bg-[#f1f5f9] sm:p-6">
             <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-800 mb-4 group-hover:scale-110 transition-transform border border-slate-100">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
             </div>
             <span className="text-[15px] font-bold text-slate-700 tracking-tight">Create New Board</span>
          </button>
        </div>
      </div>


      <button onClick={openCreateBoardModal} className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#3525cd] text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-[#4f46e5] sm:bottom-8 sm:right-8 sm:h-14 sm:w-14">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      </button>
    </div>
  );
}
