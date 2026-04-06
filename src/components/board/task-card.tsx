"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDeleteTaskMutation } from "@/features/tasks/hooks/use-delete-task-mutation";
import { formatTaskDueAt } from "@/features/tasks/lib/task-metadata";
import type { Task } from "@/features/tasks/types/task";
import { useToast } from "@/store/use-toast";
import { useUIStore } from "@/store/ui-store-provider";

type TaskCardProps = {
  boardId: string;
  task: Task;
  cardDragProps?: React.HTMLAttributes<HTMLElement>;
  isDragOverlay?: boolean;
  isReadOnly?: boolean;
};

function TaskCardComponent({
  boardId,
  task,
  cardDragProps,
  isDragOverlay = false,
  isReadOnly = false,
}: TaskCardProps) {
  const openEditTaskForm = useUIStore((state) => state.openEditTaskForm);
  const closeTaskForm = useUIStore((state) => state.closeTaskForm);
  const editingTaskId = useUIStore((state) => state.editingTaskId);
  const deleteTaskMutation = useDeleteTaskMutation(boardId);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const showToast = useToast();
  const footerMeta = getTaskFooterMeta(task);
  const leftBorderColorClass = getTaskAccentBorderClass(task);

  function handleOpenDeleteModal(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (isReadOnly || isDragOverlay || deleteTaskMutation.isPending) {
      return;
    }

    setIsDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (isReadOnly || isDragOverlay || deleteTaskMutation.isPending) {
      return;
    }

    try {
      await deleteTaskMutation.mutateAsync(task.id);
      setIsDeleteModalOpen(false);

      if (editingTaskId === task.id) {
        closeTaskForm();
      }

      showToast("success", "Task deleted.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to delete the task.",
      );
    }
  }

  function handleCloseDeleteModal() {
    if (deleteTaskMutation.isPending) {
      return;
    }

    setIsDeleteModalOpen(false);
  }

  return (
    <>
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
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => openEditTaskForm(task.id)}
              className="text-slate-300 transition hover:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </button>
            {!isDragOverlay ? (
              <button
                type="button"
                aria-label={`Delete ${task.title}`}
                disabled={isReadOnly || deleteTaskMutation.isPending}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleOpenDeleteModal}
                className="text-slate-300 transition hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            ) : null}
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
      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        isPending={deleteTaskMutation.isPending}
        taskTitle={task.title}
        onClose={handleCloseDeleteModal}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </>
  );
}

type DeleteTaskModalProps = {
  isOpen: boolean;
  isPending: boolean;
  taskTitle: string;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteTaskModal({
  isOpen,
  isPending,
  taskTitle,
  onClose,
  onConfirm,
}: DeleteTaskModalProps) {
  const handleClose = useCallback(() => {
    if (!isPending) {
      onClose();
    }
  }, [isPending, onClose]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "unset";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleClose, isOpen]);

  if (typeof document === "undefined" || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[4px] transition-all"
        onClick={handleClose}
      />

      <div
        className="relative flex w-full max-w-[460px] flex-col rounded-xl bg-[#f0f2f8] p-8 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-task-modal-title"
      >
        <div className="mb-2 flex items-start justify-between">
          <h2
            id="delete-task-modal-title"
            className="text-[22px] font-bold tracking-tight text-slate-900"
          >
            Delete Task
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-slate-700 disabled:opacity-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <p className="pr-8 text-[14px] leading-relaxed text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-900">{taskTitle}</span>? This
          action cannot be undone.
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-xl px-5 py-2.5 text-[14px] font-bold text-slate-600 transition hover:bg-slate-200/60 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
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
