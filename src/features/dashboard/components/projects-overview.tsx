"use client";

import { useBoardsQuery } from "@/features/boards/hooks/use-boards-query";
import type { BoardSummary } from "@/features/boards/types/board";
import { DashboardMetricsGrid } from "@/features/dashboard/components/dashboard-metrics-grid";
import { PinnedBoardsSection } from "@/features/dashboard/components/pinned-boards-section";
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
      <DashboardMetricsGrid
        boards={boardList}
        metrics={metrics}
        formatMetric={formatMetric}
        completionRate={getCompletionRate(metrics)}
      />
      <PinnedBoardsSection
        boards={pinnedBoards}
        onCreateBoard={openCreateBoardModal}
      />
    </div>
  );
}
