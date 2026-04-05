"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/features/tasks/api/create-task";
import { tasksQueryKeys } from "@/features/tasks/query-keys";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
    },
  });
}
