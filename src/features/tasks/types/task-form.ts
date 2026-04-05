import type { TaskPriority } from "@/types/database";
import type { TaskStatus } from "@/features/tasks/types/task";

export type TaskEditorValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  labels: string;
  assigneeId: string;
};

export type TaskMutationInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  labels: string[];
  assigneeId: string | null;
};

export type CreateTaskInput = TaskMutationInput & {
  position: number;
};

export type UpdateTaskInput = TaskMutationInput & {
  id: string;
  position: number;
};
