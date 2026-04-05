import { requestJson } from "@/lib/query/request-json";
import type { UpdateTaskInput } from "@/features/tasks/types/task-form";
import type { Task } from "@/features/tasks/types/task";

export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  return requestJson<Task>(`/api/tasks/${input.id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
