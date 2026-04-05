"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import { updateTask } from "@/features/tasks/api/update-task";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { Task } from "@/features/tasks/types/task";

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: async (updatedTask) => {
      queryClient.setQueryData<Task[]>(tasksQueryKeys.list(), (currentTasks = []) =>
        orderTasksForBoard(
          currentTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          ),
        ),
      );

      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
    },
  });
}
