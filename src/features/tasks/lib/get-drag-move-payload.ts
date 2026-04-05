import { groupTasksByStatus } from "@/features/tasks/lib/group-tasks-by-status";
import { getInsertionPosition } from "@/features/tasks/lib/get-insertion-position";
import type { Task, TaskStatus } from "@/features/tasks/types/task";

type GetDragMovePayloadParams = {
  tasks: Task[];
  taskId: string;
  updatedBy: string;
};

export type DragMovePayload = {
  id: string;
  status: TaskStatus;
  position: number;
  updatedBy: string;
};

export function getDragMovePayload({
  tasks,
  taskId,
  updatedBy,
}: GetDragMovePayloadParams): DragMovePayload | null {
  const taskGroups = groupTasksByStatus(tasks);
  const activeTask = tasks.find((task) => task.id === taskId);

  if (!activeTask) {
    return null;
  }

  const destinationTasks = taskGroups[activeTask.status];
  const destinationIndex = destinationTasks.findIndex((task) => task.id === taskId);

  if (destinationIndex < 0) {
    return null;
  }

  const previousTask = destinationTasks[destinationIndex - 1];
  const nextTask = destinationTasks[destinationIndex + 1];

  return {
    id: taskId,
    status: activeTask.status,
    position: getInsertionPosition({
      previousPosition: previousTask?.position,
      nextPosition: nextTask?.position,
    }),
    updatedBy,
  };
}
