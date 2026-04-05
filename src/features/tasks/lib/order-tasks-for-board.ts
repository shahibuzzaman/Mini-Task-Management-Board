import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";
import {
  flattenTaskGroups,
  groupTasksByStatus,
} from "@/features/tasks/lib/group-tasks-by-status";
import { compareTasksByPosition } from "@/features/tasks/lib/task-ordering";
import type { Task } from "@/features/tasks/types/task";

export function orderTasksForBoard(tasks: Task[]): Task[] {
  const taskGroups = groupTasksByStatus(tasks);

  for (const column of TASK_COLUMNS) {
    taskGroups[column.status].sort(compareTasksByPosition);
  }

  return flattenTaskGroups(taskGroups);
}
