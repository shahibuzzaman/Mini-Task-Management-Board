import { requestJson } from "@/lib/query/request-json";
import type { CreateTaskInput } from "@/features/tasks/types/task-form";
import type { Task } from "@/features/tasks/types/task";

export async function createTask(input: CreateTaskInput): Promise<Task> {
  return requestJson<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
