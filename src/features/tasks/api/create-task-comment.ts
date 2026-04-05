import { requestJson } from "@/lib/query/request-json";
import type { TaskComment } from "@/features/tasks/types/task";

export async function createTaskComment(
  boardId: string,
  taskId: string,
  body: string,
): Promise<TaskComment> {
  return requestJson<TaskComment>(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      boardId,
      body,
    }),
  });
}
