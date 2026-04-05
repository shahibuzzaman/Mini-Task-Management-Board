"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/features/tasks/api/update-task";
import { upsertTaskInTasksCache } from "@/features/tasks/lib/upsert-task-in-tasks-cache";
import { tasksQueryKeys } from "@/features/tasks/query-keys";

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: async (updatedTask) => {
      const didPatchCache = upsertTaskInTasksCache(queryClient, updatedTask);

      if (!didPatchCache) {
        await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
      }
    },
  });
}
