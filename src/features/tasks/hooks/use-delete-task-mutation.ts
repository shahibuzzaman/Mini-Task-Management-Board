"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/features/tasks/api/delete-task";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { Task } from "@/features/tasks/types/task";

export function useDeleteTaskMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(boardId, taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKeys.list(boardId) });

      const previousTasks =
        queryClient.getQueryData<Task[]>(tasksQueryKeys.list(boardId)) ?? null;

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          tasksQueryKeys.list(boardId),
          previousTasks.filter((task) => task.id !== taskId),
        );
      }

      queryClient.removeQueries({
        queryKey: tasksQueryKeys.details(boardId, taskId),
      });

      return { previousTasks };
    },
    onError: async (_error, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(tasksQueryKeys.list(boardId), context.previousTasks);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list(boardId) });
    },
    onSettled: async (_data, _error, taskId) => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list(boardId) });

      if (taskId) {
        queryClient.removeQueries({
          queryKey: tasksQueryKeys.details(boardId, taskId),
        });
      }
    },
  });
}
