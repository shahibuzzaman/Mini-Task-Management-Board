"use client";

import { useMemo } from "react";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import { useBoardMembersQuery } from "@/features/boards/hooks/use-board-members-query";
import { TaskFormModal } from "@/components/board/task-form-modal";
import { TaskBoard } from "@/components/board/task-board";
import { useCreateTaskMutation } from "@/features/tasks/hooks/use-create-task-mutation";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks-query";
import { useTasksRealtimeSync } from "@/features/tasks/hooks/use-tasks-realtime-sync";
import { useUpdateTaskMutation } from "@/features/tasks/hooks/use-update-task-mutation";
import { getNextTaskPosition } from "@/features/tasks/lib/get-next-task-position";
import type { TaskMutationInput } from "@/features/tasks/types/task-form";
import { useToast } from "@/store/use-toast";
import { useUIStore } from "@/store/ui-store-provider";

type TaskBoardShellProps = {
  board: BoardSummary;
  viewer: AuthViewer;
};

export function TaskBoardShell({ board, viewer }: TaskBoardShellProps) {
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

  async function handleSubmit(values: TaskMutationInput) {
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
        closeTaskForm();
        showToast("success", "Task changes saved.");
        return;
      }

      const position = getNextTaskPosition(tasksQuery.data ?? [], values.status);

      await createTaskMutation.mutateAsync({
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        dueAt: values.dueAt,
        labels: values.labels,
        assigneeId: values.assigneeId,
        position,
      });
      closeTaskForm();
      showToast("success", "Task created successfully.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to save the task.",
      );
    }
  }

  return (
    <>
      <TaskBoard
        board={board}
        viewer={viewer}
        tasks={tasksQuery.data ?? []}
        isLoading={tasksQuery.isLoading}
        errorMessage={tasksQuery.isError ? tasksQuery.error.message : null}
      />
      <TaskFormModal
        key={`${editingTask?.id ?? "create"}-${isTaskFormOpen ? "open" : "closed"}`}
        mode={editingTask ? "edit" : "create"}
        task={editingTask}
        initialStatus={createTaskStatus}
        isOpen={isTaskFormOpen}
        boardId={board.id}
        members={membersQuery.data ?? []}
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
