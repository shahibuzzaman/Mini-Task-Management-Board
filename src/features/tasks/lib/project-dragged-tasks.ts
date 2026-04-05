import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";
import { groupTasksByStatus } from "@/features/tasks/lib/group-tasks-by-status";
import { orderTasksForBoard } from "@/features/tasks/lib/order-tasks-for-board";
import type { Task, TaskGroupMap, TaskStatus } from "@/features/tasks/types/task";

export type DragDestination = {
  status: TaskStatus;
  index: number;
};

type ProjectDraggedTasksParams = {
  tasks: Task[];
  taskId: string;
  destination: DragDestination;
};

export function projectDraggedTasks({
  tasks,
  taskId,
  destination,
}: ProjectDraggedTasksParams): Task[] {
  const taskGroups = groupTasksByStatus(tasks);
  const activeTask = tasks.find((task) => task.id === taskId);

  if (!activeTask) {
    return tasks;
  }

  const nextGroups = cloneTaskGroups(taskGroups);

  nextGroups[activeTask.status] = nextGroups[activeTask.status].filter(
    (task) => task.id !== taskId,
  );

  const destinationTasks = [...nextGroups[destination.status]];
  const destinationIndex = Math.max(
    0,
    Math.min(destination.index, destinationTasks.length),
  );

  destinationTasks.splice(destinationIndex, 0, {
    ...activeTask,
    status: destination.status,
  });

  nextGroups[destination.status] = destinationTasks;

  return orderTasksForBoard(
    TASK_COLUMNS.flatMap((column) => nextGroups[column.status]),
  );
}

function cloneTaskGroups(taskGroups: TaskGroupMap): TaskGroupMap {
  return {
    todo: [...taskGroups.todo],
    in_progress: [...taskGroups.in_progress],
    done: [...taskGroups.done],
  };
}
