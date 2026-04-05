import { requestJson } from "@/lib/query/request-json";
import type { Task } from "@/features/tasks/types/task";

export type MoveTaskInput = {
  id: string;
  status: Task["status"];
  position: number;
};

export async function moveTask(input: MoveTaskInput): Promise<Task> {
  return requestJson<Task>(`/api/tasks/${input.id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
