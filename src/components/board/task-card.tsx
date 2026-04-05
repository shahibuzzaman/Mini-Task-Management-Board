"use client";

import { memo } from "react";
import type { Task } from "@/features/tasks/types/task";
import { useUIStore } from "@/store/ui-store-provider";

type TaskCardProps = {
  task: Task;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragOverlay?: boolean;
  isReadOnly?: boolean;
};

function TaskCardComponent({
  task,
  dragHandleProps,
  isDragOverlay = false,
  isReadOnly = false,
}: TaskCardProps) {
  const openEditTaskForm = useUIStore((state) => state.openEditTaskForm);

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Drag ${task.title}`}
            disabled={isReadOnly}
            className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            {...dragHandleProps}
          >
            ::
          </button>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {getVisibleTaskId(task.id)}
          </p>
        </div>
        {!isDragOverlay && !isReadOnly ? (
          <button
            type="button"
            onClick={() => openEditTaskForm(task.id)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white"
          >
            Edit
          </button>
        ) : null}
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900">
        {task.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        Updated by {task.updatedByName}
      </p>
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);

function getVisibleTaskId(taskId: string): string {
  if (taskId.split("-")[0] === taskId) {
    return taskId.slice(0, 8).toUpperCase();
  }

  return (
    taskId.split("-").at(-1)?.slice(0, 8).toUpperCase() ??
    taskId.slice(0, 8).toUpperCase()
  );
}
