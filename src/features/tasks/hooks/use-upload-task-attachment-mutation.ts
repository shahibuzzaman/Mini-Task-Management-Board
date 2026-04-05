"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadTaskAttachment } from "@/features/tasks/api/upload-task-attachment";
import type { TaskDetails } from "@/features/tasks/api/get-task-details";
import { tasksQueryKeys } from "@/features/tasks/query-keys";

export function useUploadTaskAttachmentMutation(
  boardId: string,
  taskId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadTaskAttachment(boardId, taskId, file),
    onSuccess: (attachment) => {
      queryClient.setQueryData<TaskDetails | undefined>(
        tasksQueryKeys.details(boardId, taskId),
        (currentDetails) => ({
          comments: currentDetails?.comments ?? [],
          attachments: currentDetails
            ? [attachment, ...currentDetails.attachments]
            : [attachment],
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
