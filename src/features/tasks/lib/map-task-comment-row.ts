import type { TaskComment } from "@/features/tasks/types/task";

export type TaskCommentRecord = {
  id: string;
  task_id: string;
  body: string;
  created_by: string;
  created_at: string;
  author_profile: {
    display_name: string | null;
  } | null;
};

export function mapTaskCommentRowToTaskComment(
  row: TaskCommentRecord,
): TaskComment {
  return {
    id: row.id,
    taskId: row.task_id,
    body: row.body,
    createdById: row.created_by,
    createdByName: row.author_profile?.display_name ?? "Unknown user",
    createdAt: row.created_at,
  };
}
