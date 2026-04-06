"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { BoardErrorState } from "@/components/board/board-error-state";
import { BoardLoadingState } from "@/components/board/board-loading-state";
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
  onSubmit: (values: TaskMutationInput) => Promise<void>;
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
  const priorityId = useId();
  const dueAtId = useId();
  const labelsId = useId();
  const assigneeId = useId();

  const [commentBody, setCommentBody] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  async function handleUploadAttachment() {
    if (!task || !selectedFile) {
      return;
    }

    try {
      await uploadAttachmentMutation.mutateAsync(selectedFile);
      setSelectedFile(null);
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="task-form-title" className="text-xl font-semibold text-slate-950">
              {mode === "create" ? "Create task" : "Edit task"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {mode === "create"
                ? "Add a new task with assignee, priority, labels, and due date."
                : "Update task details, attachments, and discussion in one place."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit({
              title: values.title.trim(),
              description: values.description.trim(),
              status: values.status,
              priority: values.priority,
              dueAt: normalizeTaskDueAt(values.dueAt),
              labels: parseTaskLabels(values.labels),
              assigneeId: values.assigneeId.trim() || null,
            });
          })}
        >
          <div>
            <label
              htmlFor={titleId}
              className="block text-sm font-medium text-slate-800"
            >
              Title
            </label>
            <input
              id={titleId}
              autoFocus
              type="text"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              {...form.register("title")}
            />
            <FieldError message={form.formState.errors.title?.message} />
          </div>

          <div>
            <label
              htmlFor={descriptionId}
              className="block text-sm font-medium text-slate-800"
            >
              Description
            </label>
            <textarea
              id={descriptionId}
              rows={5}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              {...form.register("description")}
            />
            <FieldError message={form.formState.errors.description?.message} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={statusId}
                className="block text-sm font-medium text-slate-800"
              >
                Column
              </label>
              <select
                id={statusId}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                {...form.register("status")}
              >
                {TASK_COLUMNS.map((column) => (
                  <option key={column.status} value={column.status}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={priorityId}
                className="block text-sm font-medium text-slate-800"
              >
                Priority
              </label>
              <select
                id={priorityId}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                {...form.register("priority")}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={dueAtId}
                className="block text-sm font-medium text-slate-800"
              >
                Due date
              </label>
              <input
                id={dueAtId}
                type="datetime-local"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                {...form.register("dueAt")}
              />
              <FieldError message={form.formState.errors.dueAt?.message} />
            </div>

            <div>
              <label
                htmlFor={assigneeId}
                className="block text-sm font-medium text-slate-800"
              >
                Assignee
              </label>
              <select
                id={assigneeId}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                {...form.register("assigneeId")}
              >
                <option value="">Unassigned</option>
                {sortedMembers.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.displayName}
                  </option>
                ))}
              </select>
              <FieldError message={form.formState.errors.assigneeId?.message} />
            </div>
          </div>

          <div>
            <label
              htmlFor={labelsId}
              className="block text-sm font-medium text-slate-800"
            >
              Labels
            </label>
            <input
              id={labelsId}
              type="text"
              placeholder="design, frontend, blocked"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              {...form.register("labels")}
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Separate labels with commas. Up to 8 labels are supported.
            </p>
            <FieldError message={form.formState.errors.labels?.message} />
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {isPending
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create task"
                  : "Save changes"}
            </button>
          </div>
        </form>

        {task ? (
          <div className="mt-8 grid gap-6 border-t border-slate-200 pt-6 lg:grid-cols-2">
            <section>
              <header>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Attachments
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Upload supporting files up to 10 MB.
                </p>
              </header>

              <div className="mt-4 space-y-3">
                <input
                  type="file"
                  onChange={(event) =>
                    setSelectedFile(event.target.files?.[0] ?? null)
                  }
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                />
                <button
                  type="button"
                  disabled={!selectedFile || uploadAttachmentMutation.isPending}
                  onClick={() => void handleUploadAttachment()}
                  className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  {uploadAttachmentMutation.isPending
                    ? "Uploading..."
                    : "Upload attachment"}
                </button>
              </div>

              <div className="mt-4">
                {detailsQuery.isLoading ? (
                  <BoardLoadingState />
                ) : detailsQuery.isError ? (
                  <BoardErrorState message={detailsQuery.error.message} />
                ) : detailsQuery.data && detailsQuery.data.attachments.length > 0 ? (
                  <ul className="space-y-3">
                    {detailsQuery.data.attachments.map((attachment) => (
                      <li
                        key={attachment.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <a
                              href={attachment.publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-slate-950 underline-offset-4 hover:underline"
                            >
                              {attachment.fileName}
                            </a>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {formatTaskAttachmentSize(attachment.sizeBytes)} · Uploaded by{" "}
                              {attachment.uploadedByName}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={
                              deleteAttachmentMutation.isPending &&
                              deleteAttachmentMutation.variables === attachment.id
                            }
                            onClick={() => void handleRemoveAttachment(attachment.id)}
                            className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
                    No attachments yet.
                  </p>
                )}
              </div>
            </section>

            <section>
              <header>
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Comments
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Capture discussion and implementation notes.
                </p>
              </header>

              <div className="mt-4 space-y-3">
                <textarea
                  rows={4}
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Add context for the next collaborator..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
                <button
                  type="button"
                  disabled={
                    commentBody.trim().length === 0 || createCommentMutation.isPending
                  }
                  onClick={() => void handleCreateComment()}
                  className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  {createCommentMutation.isPending ? "Posting..." : "Add comment"}
                </button>
              </div>

              <div className="mt-4">
                {detailsQuery.isLoading ? (
                  <BoardLoadingState />
                ) : detailsQuery.isError ? (
                  <BoardErrorState message={detailsQuery.error.message} />
                ) : detailsQuery.data && detailsQuery.data.comments.length > 0 ? (
                  <ul className="space-y-3">
                    {detailsQuery.data.comments.map((comment) => (
                      <li
                        key={comment.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <p className="text-sm leading-6 text-slate-700">{comment.body}</p>
                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          {comment.createdByName}
                          {formatTaskDueAt(comment.createdAt)
                            ? ` · ${formatTaskDueAt(comment.createdAt)}`
                            : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-600">
                    No comments yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : null}
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
