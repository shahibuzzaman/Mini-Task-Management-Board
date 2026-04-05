import { requestJson } from "@/lib/query/request-json";

export async function deleteTaskAttachment(
  boardId: string,
  taskId: string,
  attachmentId: string,
): Promise<void> {
  await requestJson<null>(
    `/api/tasks/${taskId}/attachments/${attachmentId}?boardId=${boardId}`,
    {
      method: "DELETE",
    },
  );
}
