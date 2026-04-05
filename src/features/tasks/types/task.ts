import type { TaskPriority } from "@/types/database";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskComment = {
  id: string;
  taskId: string;
  body: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
};

export type TaskAttachment = {
  id: string;
  taskId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
  publicUrl: string;
};

export type Task = {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string | null;
  labels: string[];
  assigneeId: string | null;
  assigneeName: string | null;
  position: number;
  updatedById: string;
  updatedByName: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskGroupMap = Record<TaskStatus, Task[]>;
