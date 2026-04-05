import { getTaskAttachmentPublicUrl } from "@/features/tasks/lib/task-attachments";
import type { TaskAttachment } from "@/features/tasks/types/task";

export type TaskAttachmentRecord = {
  id: string;
  task_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
  uploader_profile: {
    display_name: string | null;
  } | null;
};

export function mapTaskAttachmentRowToTaskAttachment(
  row: TaskAttachmentRecord,
  supabaseUrl: string,
): TaskAttachment {
  return {
    id: row.id,
    taskId: row.task_id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    uploadedById: row.uploaded_by,
    uploadedByName: row.uploader_profile?.display_name ?? "Unknown user",
    createdAt: row.created_at,
    publicUrl: getTaskAttachmentPublicUrl(supabaseUrl, row.storage_path),
  };
}
