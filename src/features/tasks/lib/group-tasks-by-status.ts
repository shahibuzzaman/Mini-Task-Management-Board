import type { Task, TaskGroupMap, TaskStatus } from "@/features/tasks/types/task";

const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export function groupTasksByStatus(tasks: Task[]): TaskGroupMap {
  const groups: TaskGroupMap = {
    todo: [],
    in_progress: [],
    done: [],
  };

  for (const status of TASK_STATUSES) {
    groups[status] = tasks
      .filter((task) => task.status === status)
      .sort((left, right) => left.position - right.position);
  }

  return groups;
}
