import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";
import { groupTasksByStatus } from "@/features/tasks/lib/group-tasks-by-status";
import type { Task } from "@/features/tasks/types/task";

export function orderTasksForBoard(tasks: Task[]): Task[] {
  const taskGroups = groupTasksByStatus(tasks);

  return TASK_COLUMNS.flatMap((column) => taskGroups[column.status]);
}
