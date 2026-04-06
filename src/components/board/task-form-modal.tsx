"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BoardErrorState } from "@/components/board/board-error-state";
import { TaskActivityLoadingState } from "@/components/board/board-loading-state";
import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";
import {
  formatTaskAttachmentSize,
  formatTaskDueAt,
  formatTaskLabels,
  normalizeTaskDueAt,
  parseTaskLabels,
  toTaskDueAtInputValue,
} from "@/features/tasks/lib/task-metadata";
import {
  taskFormSchema,
  type TaskFormSchema,
} from "@/features/tasks/lib/task-form-schema";
import { TASK_PRIORITIES } from "@/features/tasks/lib/task-priority";
import { useCreateTaskCommentMutation } from "@/features/tasks/hooks/use-create-task-comment-mutation";
import { useDeleteTaskAttachmentMutation } from "@/features/tasks/hooks/use-delete-task-attachment-mutation";
import { useTaskDetailsQuery } from "@/features/tasks/hooks/use-task-details-query";
import { useUploadTaskAttachmentMutation } from "@/features/tasks/hooks/use-upload-task-attachment-mutation";
import type { Task } from "@/features/tasks/types/task";
import type {
  TaskEditorValues,
  TaskMutationInput,
} from "@/features/tasks/types/task-form";
import type { BoardMember } from "@/features/boards/types/board-member";
import { useToast } from "@/store/use-toast";

type TaskFormModalProps = {
  boardId: string;
  mode: "create" | "edit";
  task?: Task;
  initialStatus?: TaskEditorValues["status"];
  members: BoardMember[];
  isOpen: boolean;
  isPending: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (values: TaskMutationInput, pendingFiles: File[]) => Promise<void>;
};

const DEFAULT_VALUES: TaskEditorValues = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueAt: "",
  labels: "",
  assigneeId: "",
};

function getInitialValues(
  task?: Task,
  initialStatus: TaskEditorValues["status"] = "todo",
): TaskEditorValues {
  if (!task) {
    return {
      ...DEFAULT_VALUES,
      status: initialStatus,
    };
  }

  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueAt: toTaskDueAtInputValue(task.dueAt),
    labels: formatTaskLabels(task.labels),
    assigneeId: task.assigneeId ?? "",
  };
}

export function TaskFormModal({
  boardId,
  mode,
  task,
  initialStatus = "todo",
  members,
  isOpen,
  isPending,
  errorMessage,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const statusId = useId();
  const labelsId = useId();
  const assigneeId = useId();

  const [commentBody, setCommentBody] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const showToast = useToast();
  const initialValues = useMemo(
    () => getInitialValues(task, initialStatus),
    [initialStatus, task],
  );

  const form = useForm<TaskFormSchema>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialValues,
  });

  const detailsQuery = useTaskDetailsQuery(boardId, task?.id, isOpen && !!task);
  const createCommentMutation = useCreateTaskCommentMutation(boardId, task?.id ?? "");
  const uploadAttachmentMutation = useUploadTaskAttachmentMutation(
    boardId,
    task?.id ?? "",
  );
  const deleteAttachmentMutation = useDeleteTaskAttachmentMutation(
    boardId,
    task?.id ?? "",
  );

  const sortedMembers = useMemo(
    () =>
      [...members].sort((left, right) =>
        left.displayName.localeCompare(right.displayName),
      ),
    [members],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  async function handleCreateComment() {
    if (!task || commentBody.trim().length === 0) {
      return;
    }

    try {
      await createCommentMutation.mutateAsync(commentBody.trim());
      setCommentBody("");
      showToast("success", "Comment added.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to add the comment.",
      );
    }
  }

  async function handleUploadAttachment(file: File) {
    if (!task) {
      return;
    }
    try {
      await uploadAttachmentMutation.mutateAsync(file);
      showToast("success", "Attachment uploaded.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to upload the attachment.",
      );
    }
  }

  async function handleRemoveAttachment(attachmentIdToRemove: string) {
    if (!task) {
      return;
    }

    try {
      await deleteAttachmentMutation.mutateAsync(attachmentIdToRemove);
      showToast("success", "Attachment removed.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to remove the attachment.",
      );
    }
  }

  const labelClass = "block text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d] mb-2";
  const inputClass = "block w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3.5 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary";

  function handleQueueFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setPendingFiles((currentFiles) => [...currentFiles, ...Array.from(files)]);
  }

  function handleRemovePendingFile(indexToRemove: number) {
    setPendingFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove),
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[4px] transition-all"
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[90vh] w-full max-w-[580px] flex-col overflow-y-auto rounded-xl bg-[#f0f2f8] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="mb-2 flex items-start justify-between">
            <h2 id="task-form-title" className="text-[22px] font-bold tracking-tight text-slate-900">
              {mode === "create" ? "Create Task" : "Edit Task"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-slate-700"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <p className="mb-8 pr-8 text-[14px] font-medium leading-relaxed text-slate-500">
            {mode === "create"
              ? "Capture the next piece of work with assignee, priority, labels, and supporting files."
              : "Refine task details, update ownership, and keep the implementation context in one place."}
          </p>

          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit({
                title: values.title.trim(),
                description: values.description.trim(),
                status: values.status,
                priority: values.priority,
                dueAt: normalizeTaskDueAt(values.dueAt),
                labels: parseTaskLabels(values.labels),
                assigneeId: values.assigneeId.trim() || null,
              }, pendingFiles);
            })}
          >
          <div>
            <label htmlFor={titleId} className={labelClass}>
              Task Title
            </label>
            <input
              id={titleId}
              autoFocus
              type="text"
              placeholder="Enter task title..."
              className={inputClass}
              {...form.register("title")}
            />
            <FieldError message={form.formState.errors.title?.message} />
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor={statusId} className={labelClass}>
                Status
              </label>
              <select id={statusId} className={inputClass} {...form.register("status")}>
                {TASK_COLUMNS.map((column) => (
                  <option key={column.status} value={column.status}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Priority
              </label>
              <div className="flex gap-2">
                {TASK_PRIORITIES.map((priority) => {
                  const isSelected = form.watch("priority") === priority.value;
                  return (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => form.setValue("priority", priority.value)}
                      className={`min-w-[70px] rounded-lg px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest transition ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-surface-container-high text-primary/70 hover:bg-[#d5dcf5]"
                      }`}
                    >
                      {priority.value === "medium" ? "MED" : priority.value === "urgent" ? "URG" : priority.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor={descriptionId} className={labelClass}>
              Description
            </label>
            <textarea
              id={descriptionId}
              rows={4}
              placeholder="Add a detailed description..."
              className={inputClass}
              {...form.register("description")}
            />
            <FieldError message={form.formState.errors.description?.message} />
          </div>

          <div>
            <label htmlFor={assigneeId} className={labelClass}>
              Assignee
            </label>
            <select id={assigneeId} className={inputClass} {...form.register("assigneeId")}>
              <option value="">Unassigned</option>
              {sortedMembers.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.displayName}
                </option>
              ))}
            </select>
            <FieldError message={form.formState.errors.assigneeId?.message} />
          </div>

          <div>
            <label htmlFor={labelsId} className={labelClass}>
              Labels
            </label>
            <input
              id={labelsId}
              type="text"
              placeholder="Design, High Priority, Feature, Bug"
              className={inputClass}
              {...form.register("labels")}
            />
            <FieldError message={form.formState.errors.labels?.message} />
          </div>

          {task ? (
            <div>
              <label className={labelClass}>
                File Attachment
              </label>
              <div className="relative mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-surface-container-low px-6 py-10 text-center transition hover:border-indigo-300 hover:bg-surface-container-high">
                <svg className="mb-3 h-8 w-8 text-indigo-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                </svg>
                <p className="text-[14px] font-bold text-slate-800">Drop files here or click to upload</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">PDF, PNG, JPG or ZIP (max. 10MB)</p>
                <input
                  type="file"
                  disabled={uploadAttachmentMutation.isPending}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleUploadAttachment(file);
                  }}
                  className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                  title="Upload file"
                />
              </div>
              {uploadAttachmentMutation.isPending && (
                <p className="mt-2 text-sm text-slate-500">Uploading...</p>
              )}

              {detailsQuery.data && detailsQuery.data.attachments.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {detailsQuery.data.attachments.map((attachment) => (
                    <li
                      key={attachment.id}
                      className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                          </svg>
                        </div>
                        <div>
                          <a
                            href={attachment.publicUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-bold text-slate-800 underline-offset-4 hover:underline"
                          >
                            {attachment.fileName}
                          </a>
                          <p className="text-[11px] font-medium text-slate-500">
                            {formatTaskAttachmentSize(attachment.sizeBytes)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={
                          deleteAttachmentMutation.isPending &&
                          deleteAttachmentMutation.variables === attachment.id
                        }
                        onClick={() => void handleRemoveAttachment(attachment.id)}
                        className="text-slate-400 transition hover:text-slate-600"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-200 bg-surface-container-low px-6 py-10 text-center transition hover:border-indigo-300 hover:bg-surface-container-high">
                <svg className="mb-3 h-8 w-8 text-indigo-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                </svg>
                <p className="text-[14px] font-bold text-slate-800">Choose files now</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">They will upload automatically after the task is created.</p>
                <input
                  type="file"
                  multiple
                  disabled={isPending}
                  onChange={(event) => {
                    handleQueueFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                  className="absolute inset-0 z-50 h-full w-full cursor-pointer opacity-0"
                  title="Select files"
                />
              </div>

              {pendingFiles.length > 0 ? (
                <ul className="space-y-3">
                  {pendingFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3"
                    >
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">
                          {file.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500">
                          {formatTaskAttachmentSize(file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePendingFile(index)}
                        className="text-slate-400 transition hover:text-slate-600"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-[13px] leading-relaxed text-slate-500">
                Comments become available after the task is created.
              </div>
            </div>
          )}

          {errorMessage ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-8 flex items-center justify-end gap-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-[15px] font-bold text-primary transition hover:text-primary/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-primary px-8 py-3.5 text-[15px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
            >
              {isPending
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Task"
                  : "Save Changes"}
            </button>
          </div>
          </form>

          {task ? (
          <div className="mt-10 border-t border-slate-200 pt-8">
            <section>
              <header>
                <h3 className={labelClass}>
                  Comments
                </h3>
              </header>

              <div className="mt-4 space-y-3">
                <textarea
                  rows={3}
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Add context for the next collaborator..."
                  className={inputClass}
                />
                <button
                  type="button"
                  disabled={
                    commentBody.trim().length === 0 || createCommentMutation.isPending
                  }
                  onClick={() => void handleCreateComment()}
                  className="rounded-lg bg-surface-container-high px-5 py-2.5 text-[13px] font-bold text-primary transition hover:bg-[#d5dcf5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createCommentMutation.isPending ? "Posting..." : "Add Comment"}
                </button>
              </div>

              <div className="mt-6">
                {detailsQuery.isLoading ? (
                  <TaskActivityLoadingState rows={3} />
                ) : detailsQuery.isError ? (
                  <BoardErrorState message={detailsQuery.error.message} />
                ) : detailsQuery.data && detailsQuery.data.comments.length > 0 ? (
                  <ul className="space-y-3">
                    {detailsQuery.data.comments.map((comment) => (
                      <li
                        key={comment.id}
                        className="rounded-2xl border border-transparent bg-surface-container-low px-5 py-4"
                      >
                        <p className="text-[14px] leading-relaxed text-slate-700">{comment.body}</p>
                        <p className="mt-3 text-[11px] font-medium tracking-wide text-slate-500">
                          {comment.createdByName}
                          {formatTaskDueAt(comment.createdAt)
                            ? ` · ${formatTaskDueAt(comment.createdAt)}`
                            : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-[13px] text-slate-500">
                    No comments yet.
                  </p>
                )}
              </div>
            </section>
          </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type FieldErrorProps = {
  message?: string;
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-700">{message}</p>;
}
