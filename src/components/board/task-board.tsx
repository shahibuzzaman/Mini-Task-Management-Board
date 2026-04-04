import { BoardColumn } from "@/components/board/board-column";
import { BOARD_COLUMNS, groupTasksByStatus, sampleTasks } from "@/features/tasks/lib/tasks";

export function TaskBoard() {
  const tasksByStatus = groupTasksByStatus(sampleTasks);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-6">
      <div className="mb-6 flex flex-col gap-2 border-b border-slate-200 pb-6">
        <h2 className="text-xl font-semibold text-slate-950">Board Preview</h2>
        <p className="text-sm leading-6 text-slate-600">
          This is a static placeholder board to verify layout, typing, and app
          wiring before persistence and interactions are added.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {BOARD_COLUMNS.map((column) => (
          <BoardColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={tasksByStatus[column.status]}
          />
        ))}
      </div>
    </section>
  );
}
