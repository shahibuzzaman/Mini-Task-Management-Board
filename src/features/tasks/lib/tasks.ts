import type { Task, TaskStatus } from "@/types/task";

export const BOARD_COLUMNS: Array<{ status: TaskStatus; title: string }> = [
  { status: "todo", title: "To Do" },
  { status: "in_progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

export const sampleTasks: Task[] = [
  {
    id: "TASK-1",
    title: "Create the app shell",
    description: "Set up the baseline layout, providers, and folder structure.",
    status: "todo",
    position: 1000,
    updatedBy: "alice",
    createdAt: "2026-04-05T00:00:00.000Z",
    updatedAt: "2026-04-05T00:00:00.000Z",
  },
  {
    id: "TASK-2",
    title: "Model task state",
    description: "Define strict types for columns, tasks, and ordering.",
    status: "in_progress",
    position: 2000,
    updatedBy: "bob",
    createdAt: "2026-04-05T00:00:00.000Z",
    updatedAt: "2026-04-05T00:00:00.000Z",
  },
  {
    id: "TASK-3",
    title: "Prepare persistence boundaries",
    description: "Keep Supabase and query state isolated from UI-only store data.",
    status: "done",
    position: 3000,
    updatedBy: "charlie",
    createdAt: "2026-04-05T00:00:00.000Z",
    updatedAt: "2026-04-05T00:00:00.000Z",
  },
];

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  return {
    todo: tasks.filter((task) => task.status === "todo"),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    done: tasks.filter((task) => task.status === "done"),
  };
}
