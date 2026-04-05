"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/features/tasks/api/update-task";
import { tasksQueryKeys } from "@/features/tasks/query-keys";

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKeys.list() });
    },
  });
}
