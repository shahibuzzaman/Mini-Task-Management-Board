import { requestJson } from "@/lib/query/request-json";
import type { TaskAttachment, TaskComment } from "@/features/tasks/types/task";

export type TaskDetails = {
  comments: TaskComment[];
  attachments: TaskAttachment[];
};

export async function getTaskDetails(
  boardId: string,
  taskId: string,
): Promise<TaskDetails> {
  return requestJson<TaskDetails>(`/api/tasks/${taskId}/details?boardId=${boardId}`);
}
