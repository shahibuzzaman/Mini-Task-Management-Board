"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthViewer } from "@/features/auth/types/viewer";
import { createTask } from "@/features/tasks/api/create-task";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import { replaceOptimisticTaskInTasksCache } from "@/features/tasks/lib/replace-optimistic-task-in-tasks-cache";
import { upsertTaskInTasksCache } from "@/features/tasks/lib/upsert-task-in-tasks-cache";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { CreateTaskInput } from "@/features/tasks/types/task-form";
import type { Task } from "@/features/tasks/types/task";

export function useCreateTaskMutation(boardId: string, viewer: AuthViewer) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(boardId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: tasksQueryKeys.list(boardId) });

      const previousTasks =
        queryClient.getQueryData<Task[]>(tasksQueryKeys.list(boardId)) ?? null;
      const optimisticTaskId = `optimistic-${Date.now()}`;

      if (previousTasks) {
        const now = new Date().toISOString();

        queryClient.setQueryData<Task[]>(
          tasksQueryKeys.list(boardId),
          orderTasksForBoard([
            ...previousTasks,
            {
              id: optimisticTaskId,
              boardId,
              title: input.title,
              description: input.description,
              status: input.status,
              priority: input.priority,
              dueAt: input.dueAt,
              labels: input.labels,
              assigneeId: input.assigneeId,
              assigneeName: null,
              position: input.position,
              updatedById: viewer.id,
              updatedByName: viewer.displayName,
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
        queryClient.setQueryData(tasksQueryKeys.list(boardId), context.previousTasks);
        return;
      }

      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list(boardId) });
    },
    onSuccess: async (createdTask, _input, context) => {
      const didPatchCache =
        context?.optimisticTaskId != null
          ? replaceOptimisticTaskInTasksCache(
              queryClient,
              boardId,
              context.optimisticTaskId,
              createdTask,
            )
          : upsertTaskInTasksCache(queryClient, boardId, createdTask);

      if (!didPatchCache) {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list(boardId) });
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list(boardId) });
    },
  });
}
