"use client";

import type { BoardSummary } from "@/features/boards/types/board";
import type { DashboardMetrics } from "@/features/dashboard/lib/get-dashboard-metrics";
import { DashboardMetricCard } from "@/features/dashboard/components/dashboard-metric-card";

type DashboardMetricsGridProps = {
  boards: BoardSummary[];
  metrics: DashboardMetrics | null;
  formatMetric: (value: number) => string;
  completionRate: string;
};

export function DashboardMetricsGrid({
  boards,
  metrics,
  formatMetric,
  completionRate,
}: DashboardMetricsGridProps) {
  return (
    <div className="mb-10 grid grid-cols-1 gap-4 sm:mb-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <DashboardMetricCard
        label="Total Tasks"
        value={formatMetric(metrics?.totalTasks ?? 0)}
        accentClassName="bg-[#3525cd]"
        meta={
          <span className="text-slate-500">
            {formatMetric(boards.length)} boards
          </span>
        }
      />
      <DashboardMetricCard
        label="Completed"
        value={formatMetric(metrics?.completedTasks ?? 0)}
        accentClassName="bg-[#0e5c6a]"
        meta={
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="font-bold text-[#0e5c6a]">{completionRate}</span>
          </>
        }
      />
      <DashboardMetricCard
        label="In Progress"
        value={formatMetric(metrics?.inProgressTasks ?? 0)}
        accentClassName="bg-[#5e697a]"
        meta={<span className="text-slate-500">Active now</span>}
      />
      <DashboardMetricCard
        label="Overdue"
        value={formatMetric(metrics?.overdueTasks ?? 0)}
        accentClassName="bg-[#c82121]"
        valueClassName="text-[#c82121]"
        meta={
          <span className="font-extrabold text-[#c82121]">
            <span className="text-[15px] font-black">!</span>{" "}
            {(metrics?.overdueTasks ?? 0) > 0 ? "Needs attention" : "All clear"}
          </span>
        }
      />
    </div>
  );
}
