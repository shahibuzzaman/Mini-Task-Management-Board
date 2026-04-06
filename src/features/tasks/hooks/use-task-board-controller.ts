"use client";

import { useMemo } from "react";
import { useBoardMembersQuery } from "@/features/boards/hooks/use-board-members-query";
import { uploadTaskAttachment } from "@/features/tasks/api/upload-task-attachment";
import { useCreateTaskMutation } from "@/features/tasks/hooks/use-create-task-mutation";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks-query";
import { useTasksRealtimeSync } from "@/features/tasks/hooks/use-tasks-realtime-sync";
import { useUpdateTaskMutation } from "@/features/tasks/hooks/use-update-task-mutation";
import { getNextTaskPosition } from "@/features/tasks/lib/get-next-task-position";
import type { TaskMutationInput } from "@/features/tasks/types/task-form";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import { useToast } from "@/store/use-toast";
import { useUIStore } from "@/store/ui-store-provider";

type UseTaskBoardControllerOptions = {
  board: BoardSummary;
  viewer: AuthViewer;
};

export function useTaskBoardController({
  board,
  viewer,
}: UseTaskBoardControllerOptions) {
  const isTaskFormOpen = useUIStore((state) => state.isTaskFormOpen);
  const editingTaskId = useUIStore((state) => state.editingTaskId);
  const createTaskStatus = useUIStore((state) => state.createTaskStatus);
  const closeTaskForm = useUIStore((state) => state.closeTaskForm);
  const tasksQuery = useTasksQuery(board.id);
  const membersQuery = useBoardMembersQuery(board.id);
  const createTaskMutation = useCreateTaskMutation(board.id, viewer);
  const updateTaskMutation = useUpdateTaskMutation(board.id, viewer);
  const showToast = useToast();

  useTasksRealtimeSync(board.id);

  const editingTask = useMemo(() => {
    if (!editingTaskId) {
      return undefined;
    }

    return (tasksQuery.data ?? []).find((task) => task.id === editingTaskId);
  }, [editingTaskId, tasksQuery.data]);

  const errorMessage =
    createTaskMutation.error?.message ?? updateTaskMutation.error?.message;

  async function handleSubmit(values: TaskMutationInput, pendingFiles: File[]) {
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
          priority: values.priority,
          dueAt: values.dueAt,
          labels: values.labels,
          assigneeId: values.assigneeId,
          position,
        });

        if (pendingFiles.length > 0) {
          await Promise.all(
            pendingFiles.map((file) =>
              uploadTaskAttachment(board.id, editingTask.id, file),
            ),
          );
        }

        closeTaskForm();
        showToast(
          "success",
          pendingFiles.length > 0
            ? "Task changes saved and attachments uploaded."
            : "Task changes saved.",
        );
        return;
      }

      const position = getNextTaskPosition(tasksQuery.data ?? [], values.status);
      const createdTask = await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        dueAt: values.dueAt,
        labels: values.labels,
        assigneeId: values.assigneeId,
        position,
      });

      if (pendingFiles.length > 0) {
        await Promise.all(
          pendingFiles.map((file) => uploadTaskAttachment(board.id, createdTask.id, file)),
        );
      }

      closeTaskForm();
      showToast(
        "success",
        pendingFiles.length > 0
          ? "Task created and attachments uploaded."
          : "Task created successfully.",
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to save the task.",
      );
    }
  }

  return {
    board,
    viewer,
    tasks: tasksQuery.data ?? [],
    members: membersQuery.data ?? [],
    editingTask,
    isTaskFormOpen,
    createTaskStatus,
    closeTaskForm,
    errorMessage,
    isTaskMutationPending:
      createTaskMutation.isPending || updateTaskMutation.isPending,
    isBoardLoading: tasksQuery.isLoading,
    boardErrorMessage: tasksQuery.isError ? tasksQuery.error.message : null,
    handleSubmit,
  };
}
