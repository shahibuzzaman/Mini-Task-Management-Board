import type { Task, TaskStatus } from "@/features/tasks/types/task";
import { compareTasksByPosition, TASK_POSITION_STEP } from "@/features/tasks/lib/task-ordering";

export function getNextTaskPosition(tasks: Task[], status: TaskStatus): number {
  const tasksInColumn = tasks
    .filter((task) => task.status === status)
    .sort(compareTasksByPosition);

  if (tasksInColumn.length === 0) {
    return TASK_POSITION_STEP;
  }

  const lastPosition = tasksInColumn.at(-1)?.position ?? 0;

  return lastPosition + TASK_POSITION_STEP;
}
