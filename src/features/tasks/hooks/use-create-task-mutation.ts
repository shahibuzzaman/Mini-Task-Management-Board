"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/features/tasks/api/create-task";
import { upsertTaskInTasksCache } from "@/features/tasks/lib/upsert-task-in-tasks-cache";
import { tasksQueryKeys } from "@/features/tasks/query-keys";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: async (createdTask) => {
      const didPatchCache = upsertTaskInTasksCache(queryClient, createdTask);

      if (!didPatchCache) {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
      }
    },
  });
}
