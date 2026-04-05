import { requestJson } from "@/lib/query/request-json";
import type { Task } from "@/features/tasks/types/task";

export type MoveTaskInput = {
  id: string;
  status: Task["status"];
  position: number;
};

export async function moveTask(
  boardId: string,
  input: MoveTaskInput,
): Promise<Task> {
  return requestJson<Task>(`/api/tasks/${input.id}?boardId=${boardId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
