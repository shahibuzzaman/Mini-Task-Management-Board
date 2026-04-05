export const TASK_ATTACHMENTS_BUCKET = "task-attachments";
export const TASK_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

export function getTaskAttachmentPublicUrl(
  supabaseUrl: string,
  storagePath: string,
): string {
  const normalizedUrl = supabaseUrl.replace(/\/$/, "");
  return `${normalizedUrl}/storage/v1/object/public/${TASK_ATTACHMENTS_BUCKET}/${storagePath}`;
}

export function sanitizeAttachmentFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}
