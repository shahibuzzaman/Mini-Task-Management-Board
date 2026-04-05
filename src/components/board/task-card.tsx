"use client";

import { memo } from "react";
import { formatTaskDueAt } from "@/features/tasks/lib/task-metadata";
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
  const footerMeta = getTaskFooterMeta(task);

  return (
    <article
      className={`rounded-2xl bg-white p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 ${
        isDragOverlay ? "rotate-1 shadow-xl" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`h-12 w-1 rounded-full ${getTaskAccentClassName(task.priority)}`} />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {getVisibleTaskId(task.id)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Drag ${task.title}`}
            disabled={isReadOnly}
            className="rounded-full px-2 py-1 text-xs text-slate-300 transition hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            {...dragHandleProps}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 6h11" />
              <path d="M9 12h11" />
              <path d="M9 18h11" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          </button>
          {!isDragOverlay && !isReadOnly ? (
            <button
              type="button"
              onClick={() => openEditTaskForm(task.id)}
              className="text-slate-300 transition hover:text-slate-500"
              aria-label={`Edit ${task.title}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M15 5h4v4" />
                <path d="M10 14 19 5" />
                <path d="M19 14v5H5V5h5" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
      <h3 className="mt-3 text-[24px] font-semibold leading-none tracking-tight text-slate-800">
        {task.title}
      </h3>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
        {task.description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-[11px] font-semibold ${footerMeta.toneClassName}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
          {footerMeta.label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
          {getAvatarLabel(task.assigneeName ?? task.updatedByName)}
        </span>
      </div>
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);

function getTaskAccentClassName(taskPriority: Task["priority"]) {
  switch (taskPriority) {
    case "urgent":
      return "bg-rose-500";
    case "high":
      return "bg-amber-500";
    case "medium":
      return "bg-teal-700";
    case "low":
    default:
      return "bg-slate-300";
  }
}

function getTaskFooterMeta(task: Task): {
  label: string;
  toneClassName: string;
} {
  if (task.status === "done") {
    return {
      label: "Completed",
      toneClassName: "bg-violet-50 text-violet-600",
    };
  }

  if (task.status === "in_progress") {
    return {
      label: "Active",
      toneClassName: "bg-cyan-50 text-cyan-700",
    };
  }

  if (task.priority === "urgent") {
    return {
      label: "Urgent",
      toneClassName: "bg-rose-50 text-rose-600",
    };
  }

  if (task.priority === "high") {
    return {
      label: "High Priority",
      toneClassName: "bg-amber-50 text-amber-700",
    };
  }

  if (task.labels.length > 0) {
    return {
      label: `#${task.labels[0]}`,
      toneClassName: "bg-slate-100 text-slate-600",
    };
  }

  if (dueAtLabelAvailable(task.dueAt)) {
    return {
      label: dueAtLabelAvailable(task.dueAt) as string,
      toneClassName: "bg-slate-100 text-slate-600",
    };
  }

  return {
    label: "New",
    toneClassName: "bg-slate-100 text-slate-600",
  };
}

function dueAtLabelAvailable(dueAt: string | null) {
  const label = formatTaskDueAt(dueAt);
  return label ? `${label}` : null;
}

function getAvatarLabel(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
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
