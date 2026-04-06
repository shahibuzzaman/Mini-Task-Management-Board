import { requestJson } from "@/lib/query/request-json";

export async function deleteTask(boardId: string, taskId: string): Promise<null> {
  return requestJson<null>(`/api/tasks/${taskId}?boardId=${boardId}`, {
    method: "DELETE",
  });
}
