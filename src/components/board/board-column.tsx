import { memo, useMemo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BoardColumnDropZone } from "@/components/board/board-column-drop-zone";
import { BoardEmptyState } from "@/components/board/board-empty-state";
import { SortableTaskCard } from "@/components/board/sortable-task-card";
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
    <section className="flex min-h-80 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Status key: <span className="font-mono">{status}</span>
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {tasks.length}
        </span>
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
                <div className="space-y-3">
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
        ) : (
          <BoardEmptyState
            title={`No ${title.toLowerCase()} tasks`}
            description="Tasks will appear here when records for this status are available."
          />
        )}
      </BoardColumnDropZone>
    </section>
  );
}

export const BoardColumn = memo(BoardColumnComponent, areBoardColumnPropsEqual);

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
