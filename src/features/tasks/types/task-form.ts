import type { TaskStatus } from "@/features/tasks/types/task";

export type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
};

export type CreateTaskInput = TaskFormValues & {
  position: number;
};

export type UpdateTaskInput = TaskFormValues & {
  id: string;
  position: number;
};
