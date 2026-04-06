"use client";

import type { TaskStatus } from "@/features/tasks/types/task";
import { useUIStore } from "@/store/ui-store-provider";

type TaskBoardActionsProps = {
  status?: TaskStatus;
  disabled?: boolean;
  disabledReason?: string;
};

export function TaskBoardActions({
  status,
  disabled = false,
  disabledReason,
}: TaskBoardActionsProps) {
  const openCreateTaskForm = useUIStore((state) => state.openCreateTaskForm);

  if (status && status !== "todo") {
    return null;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => openCreateTaskForm(status)}
      title={disabled ? disabledReason : undefined}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/10 px-4 py-3.5 text-[15px] font-medium text-slate-500 transition hover:bg-indigo-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      New Task
    </button>
  );
}
