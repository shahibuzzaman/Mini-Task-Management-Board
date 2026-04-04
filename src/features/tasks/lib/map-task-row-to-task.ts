import type { Database } from "@/types/database";
import type { Task } from "@/features/tasks/types/task";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export function mapTaskRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    position: row.position,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
