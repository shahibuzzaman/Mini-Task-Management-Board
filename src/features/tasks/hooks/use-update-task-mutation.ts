"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthViewer } from "@/features/auth/types/viewer";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import { updateTask } from "@/features/tasks/api/update-task";
import { upsertTaskInTasksCache } from "@/features/tasks/lib/upsert-task-in-tasks-cache";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { Task } from "@/features/tasks/types/task";

export function useUpdateTaskMutation(boardId: string, viewer: AuthViewer) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKeys.list(boardId) });

      const previousTasks =
        queryClient.getQueryData<Task[]>(tasksQueryKeys.list(boardId)) ?? null;

      if (previousTasks) {
        const now = new Date().toISOString();

        queryClient.setQueryData<Task[]>(
          tasksQueryKeys.list(boardId),
          orderTasksForBoard(
            previousTasks.map((task) =>
              task.id === input.id
                ? {
                    ...task,
                    title: input.title,
                    description: input.description,
                    status: input.status,
                    position: input.position,
                    updatedById: viewer.id,
                    updatedByName: viewer.displayName,
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
        queryClient.setQueryData(tasksQueryKeys.list(boardId), context.previousTasks);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list(boardId) });
    },
    onSuccess: async (updatedTask) => {
      const didPatchCache = upsertTaskInTasksCache(
        queryClient,
        boardId,
        updatedTask,
      );

      if (!didPatchCache) {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list(boardId) });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list(boardId) });
    },
  });
}
