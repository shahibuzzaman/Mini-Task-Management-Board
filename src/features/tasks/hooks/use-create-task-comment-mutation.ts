"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTaskComment } from "@/features/tasks/api/create-task-comment";
import type { TaskDetails } from "@/features/tasks/api/get-task-details";
import { tasksQueryKeys } from "@/features/tasks/query-keys";

export function useCreateTaskCommentMutation(boardId: string, taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => createTaskComment(boardId, taskId, body),
    onSuccess: (comment) => {
      queryClient.setQueryData<TaskDetails | undefined>(
        tasksQueryKeys.details(boardId, taskId),
        (currentDetails) => ({
          comments: currentDetails ? [...currentDetails.comments, comment] : [comment],
          attachments: currentDetails?.attachments ?? [],
        }),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: tasksQueryKeys.details(boardId, taskId),
      });
    },
  });
}
