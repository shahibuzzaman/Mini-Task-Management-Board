"use client";

import { useUIStore } from "@/store/ui-store-provider";

type TaskBoardActionsProps = {
  disabled?: boolean;
  disabledReason?: string;
};

export function TaskBoardActions({
  disabled = false,
  disabledReason,
}: TaskBoardActionsProps) {
  const openCreateTaskForm = useUIStore((state) => state.openCreateTaskForm);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={openCreateTaskForm}
      title={disabled ? disabledReason : undefined}
      className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
    >
      Create task
    </button>
  );
}
