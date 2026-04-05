import type { QueryClient } from "@tanstack/react-query";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import { tasksQueryKeys } from "@/features/tasks/query-keys";
import type { Task } from "@/features/tasks/types/task";

export function replaceOptimisticTaskInTasksCache(
  queryClient: QueryClient,
  optimisticTaskId: string,
  serverTask: Task,
): boolean {
  const currentTasks = queryClient.getQueryData<Task[]>(tasksQueryKeys.list());

  if (!currentTasks) {
    return false;
  }

  queryClient.setQueryData<Task[]>(
    tasksQueryKeys.list(),
    orderTasksForBoard([
      ...currentTasks.filter(
        (task) => task.id !== optimisticTaskId && task.id !== serverTask.id,
      ),
      serverTask,
    ]),
  );

  return true;
}
