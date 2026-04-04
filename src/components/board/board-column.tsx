import { BoardEmptyState } from "@/components/board/board-empty-state";
import { TaskCard } from "@/components/board/task-card";
import type { Task, TaskStatus } from "@/features/tasks/types/task";

type BoardColumnProps = {
  title: string;
  status: TaskStatus;
  tasks: Task[];
};

export function BoardColumn({ title, status, tasks }: BoardColumnProps) {
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

      <div className="flex flex-1 flex-col gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <BoardEmptyState
            title={`No ${title.toLowerCase()} tasks`}
            description="Tasks will appear here when records for this status are available."
          />
        )}
      </div>
    </section>
  );
}
