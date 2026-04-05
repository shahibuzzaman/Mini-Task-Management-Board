import type { Task, TaskStatus } from "@/features/tasks/types/task";

const POSITION_STEP = 1000;

export function getNextTaskPosition(tasks: Task[], status: TaskStatus): number {
  const tasksInColumn = tasks.filter((task) => task.status === status);

  if (tasksInColumn.length === 0) {
    return POSITION_STEP;
  }

  const lastPosition = tasksInColumn.reduce((maxPosition, task) => {
    return Math.max(maxPosition, task.position);
  }, 0);

  return lastPosition + POSITION_STEP;
}
