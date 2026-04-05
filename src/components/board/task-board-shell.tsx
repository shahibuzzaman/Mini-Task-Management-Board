"use client";

import { useMemo } from "react";
import { TaskFormModal } from "@/components/board/task-form-modal";
import { TaskBoard } from "@/components/board/task-board";
import { useCreateTaskMutation } from "@/features/tasks/hooks/use-create-task-mutation";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks-query";
import { useUpdateTaskMutation } from "@/features/tasks/hooks/use-update-task-mutation";
import { getNextTaskPosition } from "@/features/tasks/lib/get-next-task-position";
import type { TaskFormValues } from "@/features/tasks/types/task-form";
import { useUIStore } from "@/store/ui-store-provider";

export function TaskBoardShell() {
  const activeUser = useUIStore((state) => state.activeUser);
  const isTaskFormOpen = useUIStore((state) => state.isTaskFormOpen);
  const editingTaskId = useUIStore((state) => state.editingTaskId);
  const closeTaskForm = useUIStore((state) => state.closeTaskForm);
  const tasksQuery = useTasksQuery();
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();

  const editingTask = useMemo(() => {
    if (!editingTaskId) {
      return undefined;
    }

    return (tasksQuery.data ?? []).find((task) => task.id === editingTaskId);
  }, [editingTaskId, tasksQuery.data]);

  const errorMessage =
    createTaskMutation.error?.message ?? updateTaskMutation.error?.message;

  async function handleSubmit(values: TaskFormValues) {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({
        id: editingTask.id,
        title: values.title,
        description: values.description,
        status: values.status,
        updatedBy: activeUser,
      });
      closeTaskForm();
      return;
    }

    const position = getNextTaskPosition(tasksQuery.data ?? [], values.status);

    await createTaskMutation.mutateAsync({
      title: values.title,
      description: values.description,
      status: values.status,
      position,
      updatedBy: activeUser,
    });
    closeTaskForm();
  }

  return (
    <>
      <TaskBoard />
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
