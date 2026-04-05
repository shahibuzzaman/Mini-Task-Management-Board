"use client";

import { useUIStore } from "@/store/ui-store-provider";

type FloatingCreateTaskButtonProps = {
  disabled?: boolean;
};

export function FloatingCreateTaskButton({
  disabled = false,
}: FloatingCreateTaskButtonProps) {
  const openCreateTaskForm = useUIStore((state) => state.openCreateTaskForm);

  return (
    <button
      type="button"
      onClick={() => openCreateTaskForm("todo")}
      disabled={disabled}
      aria-label="Create task"
      className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4f46e5] text-white shadow-[0_16px_30px_-12px_rgba(79,70,229,0.9)] transition hover:bg-[#4338ca] hover:shadow-[0_18px_34px_-12px_rgba(79,70,229,1)] disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </button>
  );
}
