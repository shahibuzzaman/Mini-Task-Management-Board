import type { Task } from "@/features/tasks/types/task";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        {getVisibleTaskId(task.id)}
      </p>
      <h3 className="mt-2 text-base font-semibold text-slate-900">
        {task.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
        Updated by {task.updatedBy}
      </p>
    </article>
  );
}

function getVisibleTaskId(taskId: string): string {
  return taskId.split("-")[0] === taskId
    ? taskId.slice(0, 8).toUpperCase()
    : taskId.split("-").at(-1)?.slice(0, 8).toUpperCase() ?? taskId.slice(0, 8).toUpperCase();
}
