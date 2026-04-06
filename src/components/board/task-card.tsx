"use client";

import { memo } from "react";
import { formatTaskDueAt } from "@/features/tasks/lib/task-metadata";
import type { Task } from "@/features/tasks/types/task";
import { useUIStore } from "@/store/ui-store-provider";

type TaskCardProps = {
  task: Task;
  cardDragProps?: React.HTMLAttributes<HTMLElement>;
  isDragOverlay?: boolean;
  isReadOnly?: boolean;
};

function TaskCardComponent({
  task,
  cardDragProps,
  isDragOverlay = false,
  isReadOnly = false,
}: TaskCardProps) {
  const openEditTaskForm = useUIStore((state) => state.openEditTaskForm);
  const footerMeta = getTaskFooterMeta(task);
  const leftBorderColorClass = getTaskAccentBorderClass(task);

  return (
    <article
      {...cardDragProps}
      className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/60 ${
        isDragOverlay ? "rotate-2 shadow-2xl ring-indigo-200" : ""
      }`}
    >
      <div className={`absolute bottom-0 left-0 top-0 w-1 sm:w-1.5 ${leftBorderColorClass}`} />
      
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          {getVisibleTaskId(task.id)}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Open ${task.title}`}
            disabled={isReadOnly}
            onClick={() => openEditTaskForm(task.id)}
            className="text-slate-300 transition hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <h3 className="mt-3 text-[15px] font-bold leading-snug tracking-tight text-slate-700">
        {task.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
        {task.description}
      </p>
      
      <div className="mt-6 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold ${footerMeta.toneClassName}`}
        >
          {footerMeta.icon}
          {footerMeta.label}
        </span>
        <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-[10px] font-bold text-surface-container-lowest shadow-sm ring-2 ring-surface-container-lowest">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigneeName ?? task.updatedByName ?? "U")}&background=random&color=fff&size=64`} alt="Avatar" className="h-full w-full object-cover" />
        </span>
      </div>
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);

function getTaskAccentBorderClass(task: Task) {
  if (task.status === "done") return "bg-indigo-400";
  if (task.status === "in_progress") return "bg-teal-700";
  if (task.priority === "urgent") return "bg-rose-500";
  if (task.priority === "high") return "bg-amber-500";
  return "bg-slate-200";
}

function getTaskBadgeIcon(type: string) {
  if (type === "completed") return <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>;
  if (type === "active") return <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2v6h-6M21 13a9 9 0 1 1-3-7.7L21 8"/></svg>;
  if (type === "urgent") return <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" stroke="white" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="white"/></svg>;
  if (type === "clock") return <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  return null;
}

function getTaskFooterMeta(task: Task): {
  label: string;
  toneClassName: string;
  icon: React.ReactNode;
} {
  if (task.status === "done") {
    return {
      label: "Completed",
      toneClassName: "bg-indigo-50 text-indigo-500",
      icon: getTaskBadgeIcon("completed")
    };
  }

  if (task.status === "in_progress") {
    return {
      label: "Active",
      toneClassName: "bg-teal-50 text-teal-700",
      icon: getTaskBadgeIcon("active")
    };
  }

  if (task.priority === "urgent") {
    return {
      label: "Urgent",
      toneClassName: "bg-rose-100 text-rose-600",
      icon: getTaskBadgeIcon("urgent")
    };
  }

  if (task.priority === "high") {
    return {
      label: "High Priority",
      toneClassName: "bg-amber-50 text-amber-700",
      icon: getTaskBadgeIcon("clock")
    };
  }

  if (task.labels.length > 0) {
    return {
      label: `#${task.labels[0]}`,
      toneClassName: "bg-slate-100 text-slate-600",
      icon: null
    };
  }

  if (dueAtLabelAvailable(task.dueAt)) {
    return {
      label: dueAtLabelAvailable(task.dueAt) as string,
      toneClassName: "bg-slate-100 text-slate-600",
      icon: getTaskBadgeIcon("clock")
    };
  }

  return {
    label: "New",
    toneClassName: "bg-slate-100 text-slate-600",
    icon: null
  };
}

function dueAtLabelAvailable(dueAt: string | null) {
  const label = formatTaskDueAt(dueAt);
  return label ? `${label}` : null;
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
