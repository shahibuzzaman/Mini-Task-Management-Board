import type { DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { groupTasksByStatus } from "@/features/tasks/lib/group-tasks-by-status";
import type { DragDestination } from "@/features/tasks/lib/project-dragged-tasks";
import type { Task, TaskStatus } from "@/features/tasks/types/task";

type DragData =
  | {
      type: "task";
      taskId: string;
      status: TaskStatus;
    }
  | {
      type: "column";
      status: TaskStatus;
    };

type SupportedDragEvent = DragOverEvent | DragEndEvent;

export function getDragDestination(
  tasks: Task[],
  event: SupportedDragEvent,
): DragDestination | null {
  const activeData = event.active.data.current as DragData | undefined;
  const over = event.over;
  const overData = over?.data.current as DragData | undefined;

  if (!activeData || activeData.type !== "task" || !over || !overData) {
    return null;
  }

  const taskGroups = groupTasksByStatus(tasks);
  const activeTask = tasks.find((task) => task.id === activeData.taskId);

  if (!activeTask) {
    return null;
  }

  if (overData.type === "column") {
    return {
      status: overData.status,
      index: taskGroups[overData.status].length,
    };
  }

  const destinationTasks = taskGroups[overData.status];
  const overIndex = destinationTasks.findIndex(
    (task) => task.id === overData.taskId,
  );

  if (overIndex < 0) {
    return null;
  }

  const isBelowOverTask =
    event.active.rect.current.translated != null &&
    event.active.rect.current.translated.top >
      over.rect.top + over.rect.height / 2;

  const rawIndex = overIndex + (isBelowOverTask ? 1 : 0);
  const sourceStatus = activeTask.status;
  const sourceIndex = taskGroups[sourceStatus].findIndex(
    (task) => task.id === activeData.taskId,
  );

  if (sourceStatus === overData.status && sourceIndex >= 0 && sourceIndex < rawIndex) {
    return {
      status: overData.status,
      index: rawIndex - 1,
    };
  }

  return {
    status: overData.status,
    index: rawIndex,
  };
}
