"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaskDetails } from "@/features/tasks/api/get-task-details";
import { tasksQueryKeys } from "@/features/tasks/query-keys";

export function useTaskDetailsQuery(
  boardId: string,
  taskId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: tasksQueryKeys.details(boardId, taskId ?? ""),
    queryFn: () => getTaskDetails(boardId, taskId ?? ""),
    enabled: enabled && boardId.length > 0 && typeof taskId === "string",
  });
}
