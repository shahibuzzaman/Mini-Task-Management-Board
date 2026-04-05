"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthViewer } from "@/features/auth/types/viewer";
import { moveTask, type MoveTaskInput } from "@/features/tasks/api/move-task";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import { upsertTaskInTasksCache } from "@/features/tasks/lib/upsert-task-in-tasks-cache";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { Task } from "@/features/tasks/types/task";

export function useMoveTaskMutation(boardId: string, viewer: AuthViewer) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MoveTaskInput) => moveTask(boardId, input),
    onMutate: async (input: MoveTaskInput) => {
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
    onSuccess: async (movedTask) => {
      const didPatchCache = upsertTaskInTasksCache(
        queryClient,
        boardId,
        movedTask,
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
