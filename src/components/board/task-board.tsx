"use client";

import { BoardColumn } from "@/components/board/board-column";
import { BoardErrorState } from "@/components/board/board-error-state";
import { BoardLoadingState } from "@/components/board/board-loading-state";
import { TaskBoardActions } from "@/components/board/task-board-actions";
import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";
import { groupTasksByStatus } from "@/features/tasks/lib/group-tasks-by-status";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks-query";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import { useUIStore } from "@/store/ui-store-provider";

export function TaskBoard() {
  const supabaseConfig = getSupabaseBrowserConfig();
  const activeUser = useUIStore((state) => state.activeUser);
  const tasksQuery = useTasksQuery();

  if (!supabaseConfig.isConfigured) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Board</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Configure Supabase to load tasks. The active simulated user is{" "}
              <span className="font-semibold text-slate-900">{activeUser}</span>.
            </p>
          </div>
          <TaskBoardActions />
        </div>
      </section>
    );
  }

  if (tasksQuery.isLoading) {
    return <BoardLoadingState />;
  }

  if (tasksQuery.isError) {
    return <BoardErrorState message={tasksQuery.error.message} />;
  }

  const tasksByStatus = groupTasksByStatus(tasksQuery.data ?? []);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
      <div className="mb-6 flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Board</h2>
          <p className="text-sm leading-6 text-slate-600">
            Tasks loaded from Supabase and grouped by status.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <p className="text-sm text-slate-500">
            Viewing as{" "}
            <span className="font-semibold text-slate-900">{activeUser}</span>
          </p>
          <TaskBoardActions />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TASK_COLUMNS.map((column) => (
          <BoardColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={tasksByStatus[column.status]}
          />
        ))}
      </div>
    </section>
  );
}
