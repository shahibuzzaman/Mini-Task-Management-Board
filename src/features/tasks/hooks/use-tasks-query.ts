"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getTasks } from "@/features/tasks/api/get-tasks";
import { tasksQueryKeys } from "@/features/tasks/query-keys";

export function useTasksQuery(boardId: string) {
  return useQuery({
    queryKey: tasksQueryKeys.list(boardId),
    queryFn: () => getTasks(boardId),
    enabled: boardId.length > 0,
    placeholderData: keepPreviousData,
  });
}
