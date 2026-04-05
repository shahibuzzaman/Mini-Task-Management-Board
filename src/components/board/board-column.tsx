import { memo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BoardColumnDropZone } from "@/components/board/board-column-drop-zone";
import { BoardEmptyState } from "@/components/board/board-empty-state";
import { SortableTaskCard } from "@/components/board/sortable-task-card";
import type { Task, TaskStatus } from "@/features/tasks/types/task";

type BoardColumnProps = {
  title: string;
  status: TaskStatus;
  tasks: Task[];
};

function BoardColumnComponent({ title, status, tasks }: BoardColumnProps) {
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
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => <SortableTaskCard key={task.id} task={task} />)
          ) : (
            <BoardEmptyState
              title={`No ${title.toLowerCase()} tasks`}
              description="Tasks will appear here when records for this status are available."
            />
          )}
        </SortableContext>
      </BoardColumnDropZone>
    </section>
  );
}

export const BoardColumn = memo(BoardColumnComponent);
