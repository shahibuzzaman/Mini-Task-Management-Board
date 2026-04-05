"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveTask, type MoveTaskInput } from "@/features/tasks/api/move-task";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import { upsertTaskInTasksCache } from "@/features/tasks/lib/upsert-task-in-tasks-cache";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { Task } from "@/features/tasks/types/task";

export function useMoveTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveTask,
    onMutate: async (input: MoveTaskInput) => {
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
    onSuccess: async (movedTask) => {
      const didPatchCache = upsertTaskInTasksCache(queryClient, movedTask);

      if (!didPatchCache) {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
    },
  });
}
