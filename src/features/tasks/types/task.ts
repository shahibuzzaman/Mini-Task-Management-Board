export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  position: number;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskGroupMap = Record<TaskStatus, Task[]>;
