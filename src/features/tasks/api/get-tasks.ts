import { requestJson } from "@/lib/query/request-json";
import type { Task } from "@/features/tasks/types/task";

export async function getTasks(boardId: string): Promise<Task[]> {
  return requestJson<Task[]>(`/api/tasks?boardId=${boardId}`);
}
