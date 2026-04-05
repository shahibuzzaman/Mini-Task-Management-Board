"use client";

import { useMemo, useState } from "react";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import { FeedbackNotice } from "@/components/board/feedback-notice";
import { TaskFormModal } from "@/components/board/task-form-modal";
import { TaskBoard } from "@/components/board/task-board";
import { useCreateTaskMutation } from "@/features/tasks/hooks/use-create-task-mutation";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks-query";
import { useTasksRealtimeSync } from "@/features/tasks/hooks/use-tasks-realtime-sync";
import { useUpdateTaskMutation } from "@/features/tasks/hooks/use-update-task-mutation";
import { getNextTaskPosition } from "@/features/tasks/lib/get-next-task-position";
import type { TaskFormValues } from "@/features/tasks/types/task-form";
import { useUIStore } from "@/store/ui-store-provider";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

type TaskBoardShellProps = {
  board: BoardSummary;
  viewer: AuthViewer;
};

export function TaskBoardShell({ board, viewer }: TaskBoardShellProps) {
  const isTaskFormOpen = useUIStore((state) => state.isTaskFormOpen);
  const editingTaskId = useUIStore((state) => state.editingTaskId);
  const closeTaskForm = useUIStore((state) => state.closeTaskForm);
  const tasksQuery = useTasksQuery(board.id);
  const createTaskMutation = useCreateTaskMutation(board.id, viewer);
  const updateTaskMutation = useUpdateTaskMutation(board.id, viewer);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  useTasksRealtimeSync(board.id);

  const editingTask = useMemo(() => {
    if (!editingTaskId) {
      return undefined;
    }

    return (tasksQuery.data ?? []).find((task) => task.id === editingTaskId);
  }, [editingTaskId, tasksQuery.data]);

  const errorMessage =
    createTaskMutation.error?.message ?? updateTaskMutation.error?.message;

  async function handleSubmit(values: TaskFormValues) {
    setFeedback(null);
    createTaskMutation.reset();
    updateTaskMutation.reset();

    try {
      if (editingTask) {
        const position =
          values.status === editingTask.status
            ? editingTask.position
            : getNextTaskPosition(
                (tasksQuery.data ?? []).filter((task) => task.id !== editingTask.id),
                values.status,
              );

        await updateTaskMutation.mutateAsync({
          id: editingTask.id,
          title: values.title,
          description: values.description,
          status: values.status,
          position,
        });
        closeTaskForm();
        setFeedback({
          kind: "success",
          message: "Task changes saved.",
        });
        return;
      }

      const position = getNextTaskPosition(tasksQuery.data ?? [], values.status);

      await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description,
        status: values.status,
        position,
      });
      closeTaskForm();
      setFeedback({
        kind: "success",
        message: "Task created successfully.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to save the task.",
      });
    }
  }

  return (
    <>
      {feedback ? (
        <FeedbackNotice
          kind={feedback.kind}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}
      <TaskBoard board={board} viewer={viewer} />
      <TaskFormModal
        mode={editingTask ? "edit" : "create"}
        task={editingTask}
        isOpen={isTaskFormOpen}
        isPending={
          createTaskMutation.isPending || updateTaskMutation.isPending
        }
        errorMessage={errorMessage}
        onClose={closeTaskForm}
        onSubmit={handleSubmit}
      />
    </>
  );
}
