"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTaskAttachment } from "@/features/tasks/api/delete-task-attachment";
import type { TaskDetails } from "@/features/tasks/api/get-task-details";
import { tasksQueryKeys } from "@/features/tasks/query-keys";

export function useDeleteTaskAttachmentMutation(
  boardId: string,
  taskId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) =>
      deleteTaskAttachment(boardId, taskId, attachmentId),
    onSuccess: (_data, attachmentId) => {
      queryClient.setQueryData<TaskDetails | undefined>(
        tasksQueryKeys.details(boardId, taskId),
        (currentDetails) =>
          currentDetails
            ? {
                comments: currentDetails.comments,
                attachments: currentDetails.attachments.filter(
                  (attachment) => attachment.id !== attachmentId,
                ),
              }
            : currentDetails,
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: tasksQueryKeys.details(boardId, taskId),
      });
    },
  });
}
