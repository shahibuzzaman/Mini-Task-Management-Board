"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { BoardColumn } from "@/components/board/board-column";
import { BoardErrorState } from "@/components/board/board-error-state";
import { BoardLoadingState } from "@/components/board/board-loading-state";
import { TaskCard } from "@/components/board/task-card";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import { useMoveTaskMutation } from "@/features/tasks/hooks/use-move-task-mutation";
import { getDragDestination } from "@/features/tasks/lib/get-drag-destination";
import { getDragMovePayload } from "@/features/tasks/lib/get-drag-move-payload";
import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";
import { groupTasksByStatus } from "@/features/tasks/lib/group-tasks-by-status";
import { projectDraggedTasks } from "@/features/tasks/lib/project-dragged-tasks";
import type { Task } from "@/features/tasks/types/task";
import { useToast } from "@/store/use-toast";

type TaskBoardProps = {
  board: BoardSummary;
  viewer: AuthViewer;
  tasks: Task[];
  isLoading: boolean;
  errorMessage: string | null;
};

export function TaskBoard({
  board,
  viewer,
  tasks,
  isLoading,
  errorMessage,
}: TaskBoardProps) {
  const moveTaskMutation = useMoveTaskMutation(board.id, viewer);
  const isReadOnly = board.archivedAt !== null;
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [projectedTasks, setProjectedTasks] = useState<Task[] | null>(null);
  const showToast = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const resolvedTasks = useMemo(
    () => projectedTasks ?? tasks,
    [projectedTasks, tasks],
  );
  const tasksByStatus = useMemo(
    () => groupTasksByStatus(resolvedTasks),
    [resolvedTasks],
  );
  const activeTask = useMemo(
    () => resolvedTasks.find((task) => task.id === activeTaskId),
    [activeTaskId, resolvedTasks],
  );

  if (isLoading) {
    return <BoardLoadingState />;
  }

  if (errorMessage) {
    return <BoardErrorState message={errorMessage} />;
  }

  function handleDragStart(event: DragStartEvent) {
    if (isReadOnly) {
      return;
    }

    setActiveTaskId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    if (isReadOnly) {
      return;
    }

    if (!event.over) {
      return;
    }

    const baseTasks = projectedTasks ?? tasks;
    const destination = getDragDestination(baseTasks, event);

    if (!destination) {
      return;
    }

    const nextProjectedTasks = projectDraggedTasks({
      tasks: baseTasks,
      taskId: String(event.active.id),
      destination,
    });

    setProjectedTasks((currentProjectedTasks) => {
      if (
        currentProjectedTasks &&
        haveTasksChangedOrder(currentProjectedTasks, nextProjectedTasks)
      ) {
        return nextProjectedTasks;
      }

      return currentProjectedTasks ?? nextProjectedTasks;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (isReadOnly) {
      setActiveTaskId(null);
      setProjectedTasks(null);
      return;
    }

    const nextTasks = projectedTasks ?? tasks;

    setActiveTaskId(null);

    if (!event.over) {
      setProjectedTasks(null);
      return;
    }

    const movePayload = getDragMovePayload({
      tasks: nextTasks,
      taskId: String(event.active.id),
    });

    setProjectedTasks(null);

    if (!movePayload) {
      return;
    }

    const originalTask = tasks.find((task) => task.id === movePayload.id);

    if (
      originalTask &&
      originalTask.status === movePayload.status &&
      originalTask.position === movePayload.position
    ) {
      return;
    }

    moveTaskMutation.reset();

    try {
      await moveTaskMutation.mutateAsync(movePayload);
      showToast("success", "Task position updated.");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to move the task.",
      );
    }
  }

  function handleDragCancel() {
    setActiveTaskId(null);
    setProjectedTasks(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <section className="rounded-[2rem] bg-[#f8f8ff] px-2 py-3 sm:px-3">
        {board.archivedAt ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This board is archived. Tasks remain visible, but create, edit, and
            drag actions are disabled until an owner unarchives it.
          </div>
        ) : null}
        <div className="grid gap-6 xl:grid-cols-3">
          {TASK_COLUMNS.map((column) => (
            <BoardColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={tasksByStatus[column.status]}
              isDragging={activeTaskId !== null}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      </section>

      <DragOverlay>
        {activeTask ? (
          <TaskCard task={activeTask} isDragOverlay isReadOnly={isReadOnly} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function haveTasksChangedOrder(currentTasks: Task[], nextTasks: Task[]): boolean {
  if (currentTasks.length !== nextTasks.length) {
    return true;
  }

  return currentTasks.some((task, index) => {
    const nextTask = nextTasks[index];
    return (
      task.id !== nextTask?.id ||
      task.status !== nextTask.status ||
      task.position !== nextTask.position
    );
  });
}
