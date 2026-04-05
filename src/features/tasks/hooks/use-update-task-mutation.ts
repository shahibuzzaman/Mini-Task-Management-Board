"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import { updateTask } from "@/features/tasks/api/update-task";
import { upsertTaskInTasksCache } from "@/features/tasks/lib/upsert-task-in-tasks-cache";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { Task } from "@/features/tasks/types/task";

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKeys.list() });

      const previousTasks =
        queryClient.getQueryData<Task[]>(tasksQueryKeys.list()) ?? null;

      if (previousTasks) {
        const now = new Date().toISOString();

        queryClient.setQueryData<Task[]>(
          tasksQueryKeys.list(),
          orderTasksForBoard(
            previousTasks.map((task) =>
              task.id === input.id
                ? {
                    ...task,
                    title: input.title,
                    description: input.description,
                    status: input.status,
                    position: input.position,
                    updatedBy: input.updatedBy,
                    updatedAt: now,
                  }
                : task,
            ),
          ),
        );
      }

      return { previousTasks };
    },
    onError: async (_error, _input, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(tasksQueryKeys.list(), context.previousTasks);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
    },
    onSuccess: async (updatedTask) => {
      const didPatchCache = upsertTaskInTasksCache(queryClient, updatedTask);

      if (!didPatchCache) {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
    },
  });
}
