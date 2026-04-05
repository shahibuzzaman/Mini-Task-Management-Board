import type { Task, TaskGroupMap } from "@/features/tasks/types/task";

export function groupTasksByStatus(tasks: Task[]): TaskGroupMap {
  const groups: TaskGroupMap = {
    todo: [],
    in_progress: [],
    done: [],
  };

  for (const task of tasks) {
    groups[task.status].push(task);
  }

  return groups;
}
