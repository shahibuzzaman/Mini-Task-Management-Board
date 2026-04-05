import { requestJson } from "@/lib/query/request-json";
import type { UpdateTaskInput } from "@/features/tasks/types/task-form";
import type { Task } from "@/features/tasks/types/task";

export async function updateTask(
  boardId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  return requestJson<Task>(`/api/tasks/${input.id}?boardId=${boardId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
