import type { TaskStatus } from "@/features/tasks/types/task";

export const TASK_COLUMNS: Array<{ status: TaskStatus; title: string }> = [
  { status: "todo", title: "To Do" },
  { status: "in_progress", title: "In Progress" },
  { status: "done", title: "Done" },
];
