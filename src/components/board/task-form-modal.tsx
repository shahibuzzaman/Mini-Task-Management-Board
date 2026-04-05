"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";
import { taskFormSchema, type TaskFormSchema } from "@/features/tasks/lib/task-form-schema";
import type { Task } from "@/features/tasks/types/task";
import type { TaskFormValues } from "@/features/tasks/types/task-form";

type TaskFormModalProps = {
  mode: "create" | "edit";
  task?: Task;
  isOpen: boolean;
  isPending: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

const DEFAULT_VALUES: TaskFormValues = {
  title: "",
  description: "",
  status: "todo",
};

export function TaskFormModal({
  mode,
  task,
  isOpen,
  isPending,
  errorMessage,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const statusId = useId();

  const form = useForm<TaskFormSchema>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(
      task
        ? {
            title: task.title,
            description: task.description,
            status: task.status,
          }
        : DEFAULT_VALUES,
    );
  }, [form, isOpen, task]);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="task-form-title" className="text-xl font-semibold text-slate-950">
              {mode === "create" ? "Create task" : "Edit task"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {mode === "create"
                ? "Add a new task and place it in the target column."
                : "Update the selected task without changing unrelated fields."}
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
            await onSubmit(values);
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
            {form.formState.errors.title ? (
              <p className="mt-2 text-sm text-rose-700">
                {form.formState.errors.title.message}
              </p>
            ) : null}
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
            {form.formState.errors.description ? (
              <p className="mt-2 text-sm text-rose-700">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

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
      </div>
    </div>
  );
}
