import type { Task } from "@/features/tasks/types/task";

export type TaskRecord = {
  id: string;
  board_id: string;
  title: string;
  description: string;
  status: Task["status"];
  position: number;
  updated_by: string;
  created_at: string;
  updated_at: string;
  updated_by_profile: {
    display_name: string | null;
  } | null;
};

export function mapTaskRowToTask(row: TaskRecord): Task {
  return {
    id: row.id,
    boardId: row.board_id,
    title: row.title,
    description: row.description,
    status: row.status,
    position: row.position,
    updatedById: row.updated_by,
    updatedByName: row.updated_by_profile?.display_name ?? "Unknown user",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
