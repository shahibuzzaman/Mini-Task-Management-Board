export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  boardId: string;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  updatedById: string;
  updatedByName: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskGroupMap = Record<TaskStatus, Task[]>;
