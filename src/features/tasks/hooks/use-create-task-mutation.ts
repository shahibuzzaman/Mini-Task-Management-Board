"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/features/tasks/api/create-task";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import { replaceOptimisticTaskInTasksCache } from "@/features/tasks/lib/replace-optimistic-task-in-tasks-cache";
import { upsertTaskInTasksCache } from "@/features/tasks/lib/upsert-task-in-tasks-cache";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { Task } from "@/features/tasks/types/task";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKeys.list() });

      const previousTasks =
        queryClient.getQueryData<Task[]>(tasksQueryKeys.list()) ?? null;
      const optimisticTaskId = `optimistic-${Date.now()}`;

      if (previousTasks) {
        const now = new Date().toISOString();

        queryClient.setQueryData<Task[]>(
          tasksQueryKeys.list(),
          orderTasksForBoard([
            ...previousTasks,
            {
              id: optimisticTaskId,
              title: input.title,
              description: input.description,
              status: input.status,
              position: input.position,
              updatedBy: input.updatedBy,
              createdAt: now,
              updatedAt: now,
            },
          ]),
        );
      }

      return { previousTasks, optimisticTaskId };
    },
    onError: async (_error, _input, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(tasksQueryKeys.list(), context.previousTasks);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
    },
    onSuccess: async (createdTask, _input, context) => {
      const didPatchCache =
        context?.optimisticTaskId != null
          ? replaceOptimisticTaskInTasksCache(
              queryClient,
              context.optimisticTaskId,
              createdTask,
            )
          : upsertTaskInTasksCache(queryClient, createdTask);

      if (!didPatchCache) {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
    },
  });
}
