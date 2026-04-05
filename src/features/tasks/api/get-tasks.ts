import { requestJson } from "@/lib/query/request-json";
import type { Task } from "@/features/tasks/types/task";

export async function getTasks(): Promise<Task[]> {
  return requestJson<Task[]>("/api/tasks");
}
