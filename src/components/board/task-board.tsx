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
import { FeedbackNotice } from "@/components/board/feedback-notice";
import { BoardLoadingState } from "@/components/board/board-loading-state";
import { TaskBoardActions } from "@/components/board/task-board-actions";
import { TaskCard } from "@/components/board/task-card";
import { useHasMounted } from "@/components/board/use-has-mounted";
import { useMoveTaskMutation } from "@/features/tasks/hooks/use-move-task-mutation";
import { getDragDestination } from "@/features/tasks/lib/get-drag-destination";
import { getDragMovePayload } from "@/features/tasks/lib/get-drag-move-payload";
import { TASK_COLUMNS } from "@/features/tasks/lib/task-columns";
import { groupTasksByStatus } from "@/features/tasks/lib/group-tasks-by-status";
import { projectDraggedTasks } from "@/features/tasks/lib/project-dragged-tasks";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks-query";
import type { Task } from "@/features/tasks/types/task";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import { useUIStore } from "@/store/ui-store-provider";

type FeedbackState = {
  kind: "success" | "error";
  message: string;
} | null;

export function TaskBoard() {
  const hasMounted = useHasMounted();
  const supabaseConfig = getSupabaseBrowserConfig();
  const activeUser = useUIStore((state) => state.activeUser);
  const tasksQuery = useTasksQuery();
  const moveTaskMutation = useMoveTaskMutation();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [projectedTasks, setProjectedTasks] = useState<Task[] | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
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
    () => projectedTasks ?? tasksQuery.data ?? [],
    [projectedTasks, tasksQuery.data],
  );
  const tasksByStatus = useMemo(
    () => groupTasksByStatus(resolvedTasks),
    [resolvedTasks],
  );
  const activeTask = useMemo(
    () => resolvedTasks.find((task) => task.id === activeTaskId),
    [activeTaskId, resolvedTasks],
  );

  if (!hasMounted) {
    return <BoardLoadingState />;
  }

  if (!supabaseConfig.isConfigured) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Board</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Configure Supabase to load tasks. The active simulated user is{" "}
              <span className="font-semibold text-slate-900">{activeUser}</span>.
            </p>
          </div>
          <TaskBoardActions disabled />
        </div>
      </section>
    );
  }

  if (tasksQuery.isLoading) {
    return <BoardLoadingState />;
  }

  if (tasksQuery.isError) {
    return <BoardErrorState message={tasksQuery.error.message} />;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    if (!event.over) {
      return;
    }

    const baseTasks = projectedTasks ?? tasksQuery.data ?? [];
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
    const nextTasks = projectedTasks ?? tasksQuery.data ?? [];

    setActiveTaskId(null);

    if (!event.over) {
      setProjectedTasks(null);
      return;
    }

    const movePayload = getDragMovePayload({
      tasks: nextTasks,
      taskId: String(event.active.id),
      updatedBy: activeUser,
    });

    setProjectedTasks(null);

    if (!movePayload) {
      return;
    }

    const originalTask = (tasksQuery.data ?? []).find(
      (task) => task.id === movePayload.id,
    );

    if (
      originalTask &&
      originalTask.status === movePayload.status &&
      originalTask.position === movePayload.position
    ) {
      return;
    }

    moveTaskMutation.reset();
    setFeedback(null);

    try {
      await moveTaskMutation.mutateAsync(movePayload);
      setFeedback({
        kind: "success",
        message: "Task position updated.",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Unable to move the task.",
      });
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
      <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
        <div className="mb-6 flex flex-col gap-2 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Board</h2>
            <p className="text-sm leading-6 text-slate-600">
              Drag tasks within or across columns. Status and midpoint-based
              positions persist on drop.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="text-sm text-slate-500">
              Viewing as{" "}
              <span className="font-semibold text-slate-900">{activeUser}</span>
            </p>
            <TaskBoardActions />
          </div>
        </div>

        {feedback ? (
          <FeedbackNotice
            kind={feedback.kind}
            message={feedback.message}
            onDismiss={() => setFeedback(null)}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {TASK_COLUMNS.map((column) => (
            <BoardColumn
              key={column.status}
              status={column.status}
              title={column.title}
              tasks={tasksByStatus[column.status]}
            />
          ))}
        </div>
      </section>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragOverlay /> : null}
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
