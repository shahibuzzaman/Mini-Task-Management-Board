import type { TaskAttachment } from "@/features/tasks/types/task";

export async function uploadTaskAttachment(
  boardId: string,
  taskId: string,
  file: File,
): Promise<TaskAttachment> {
  const formData = new FormData();
  formData.append("boardId", boardId);
  formData.append("file", file);

  const response = await fetch(`/api/tasks/${taskId}/attachments`, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | TaskAttachment
    | null;

  if (!response.ok) {
    throw new Error(
      payload && typeof payload === "object" && "error" in payload
        ? payload.error ?? "Upload failed."
        : "Upload failed.",
    );
  }

  return payload as TaskAttachment;
}
