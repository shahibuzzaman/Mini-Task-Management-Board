"use client";

import type { Task } from "@/features/tasks/types/task";
import { useUIStore } from "@/store/ui-store-provider";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  const openEditTaskForm = useUIStore((state) => state.openEditTaskForm);

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          {getVisibleTaskId(task.id)}
        </p>
        <button
          type="button"
          onClick={() => openEditTaskForm(task.id)}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white"
        >
          Edit
        </button>
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900">
        {task.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        Updated by {task.updatedBy}
      </p>
    </article>
  );
}

function getVisibleTaskId(taskId: string): string {
  if (taskId.split("-")[0] === taskId) {
    return taskId.slice(0, 8).toUpperCase();
  }

  return (
    taskId.split("-").at(-1)?.slice(0, 8).toUpperCase() ??
    taskId.slice(0, 8).toUpperCase()
  );
}
