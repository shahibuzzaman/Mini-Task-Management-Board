"use client";

import { useUIStore } from "@/store/ui-store-provider";

export function TaskBoardActions() {
  const openCreateTaskForm = useUIStore((state) => state.openCreateTaskForm);

  return (
    <button
      type="button"
      onClick={openCreateTaskForm}
      className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
    >
      Create task
    </button>
  );
}
