import type { QueryClient } from "@tanstack/react-query";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { Task } from "@/features/tasks/types/task";

export function upsertTaskInTasksCache(
  queryClient: QueryClient,
  incomingTask: Task,
): boolean {
  const currentTasks = queryClient.getQueryData<Task[]>(tasksQueryKeys.list());

  if (!currentTasks) {
    return false;
  }

  const hasExistingTask = currentTasks.some((task) => task.id === incomingTask.id);

  queryClient.setQueryData<Task[]>(
    tasksQueryKeys.list(),
    orderTasksForBoard(
      hasExistingTask
        ? currentTasks.map((task) =>
            task.id === incomingTask.id ? mergeTask(task, incomingTask) : task,
          )
        : [...currentTasks, incomingTask],
    ),
  );

  return true;
}

function mergeTask(currentTask: Task, incomingTask: Task): Task {
  return incomingTask.updatedAt >= currentTask.updatedAt ? incomingTask : currentTask;
}
