import { memo, useMemo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BoardColumnDropZone } from "@/components/board/board-column-drop-zone";
import { SortableTaskCard } from "@/components/board/sortable-task-card";
import { TaskBoardActions } from "@/components/board/task-board-actions";
import { VirtualizedTaskColumnList } from "@/components/board/virtualized-task-column-list";
import { shouldVirtualizeTaskColumn } from "@/features/tasks/lib/task-virtualization";
import type { Task, TaskStatus } from "@/features/tasks/types/task";

type BoardColumnProps = {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  isDragging: boolean;
  isReadOnly: boolean;
};

function BoardColumnComponent({
  title,
  status,
  tasks,
  isDragging,
  isReadOnly,
}: BoardColumnProps) {
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const shouldUseVirtualization =
    !isDragging && shouldVirtualizeTaskColumn(tasks.length);
  const shouldUseScrollableList = tasks.length > 12;

  return (
    <section className="flex min-h-[32rem] flex-col">
      <header className="mb-5 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <h2 className="text-[28px] font-semibold tracking-tight text-slate-800">
            {title}
          </h2>
          <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${getColumnCountTone(status)}`}>
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          className="rounded-full px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={`More options for ${title}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <circle cx="5" cy="12" r="1.75" />
            <circle cx="12" cy="12" r="1.75" />
            <circle cx="19" cy="12" r="1.75" />
          </svg>
        </button>
      </header>

      <BoardColumnDropZone status={status}>
        {tasks.length > 0 ? (
          shouldUseVirtualization ? (
            <VirtualizedTaskColumnList tasks={tasks} isReadOnly={isReadOnly} />
          ) : (
            <div
              className={
                shouldUseScrollableList ? "max-h-[36rem] overflow-y-auto pr-1" : ""
              }
            >
              <SortableContext
                items={taskIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <SortableTaskCard
                      key={task.id}
                      task={task}
                      disabled={isReadOnly}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )
        ) : null}

        <div className="mt-4">
          <TaskBoardActions
            status={status}
            disabled={isReadOnly}
            disabledReason={
              isReadOnly ? "Archived boards are read-only." : undefined
            }
          />
        </div>
      </BoardColumnDropZone>
    </section>
  );
}

export const BoardColumn = memo(BoardColumnComponent, areBoardColumnPropsEqual);

function getColumnCountTone(status: TaskStatus) {
  switch (status) {
    case "todo":
      return "bg-indigo-50 text-indigo-500";
    case "in_progress":
      return "bg-cyan-100 text-cyan-700";
    case "done":
      return "bg-indigo-50 text-indigo-500";
  }
}

function areBoardColumnPropsEqual(
  previousProps: BoardColumnProps,
  nextProps: BoardColumnProps,
) {
  if (
    previousProps.title !== nextProps.title ||
    previousProps.status !== nextProps.status ||
    previousProps.isDragging !== nextProps.isDragging ||
    previousProps.isReadOnly !== nextProps.isReadOnly ||
    previousProps.tasks.length !== nextProps.tasks.length
  ) {
    return false;
  }

  return previousProps.tasks.every((task, index) => {
    const nextTask = nextProps.tasks[index];

    return (
      task.id === nextTask?.id &&
      task.position === nextTask.position &&
      task.status === nextTask.status &&
      task.updatedAt === nextTask.updatedAt
    );
  });
}
