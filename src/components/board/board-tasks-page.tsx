import { BoardTabs } from "@/components/board/board-tabs";
import { FloatingCreateTaskButton } from "@/components/board/floating-create-task-button";
import { TaskBoardShell } from "@/components/board/task-board-shell";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";

type BoardTasksPageProps = {
  board: BoardSummary;
  viewer: AuthViewer;
};

export function BoardTasksPage({ board, viewer }: BoardTasksPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
      <header className="max-w-3xl">
        <h1 className="text-[24px] font-bold text-slate-900">
          {board.name}
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">
          {board.description.length > 0
            ? board.description
            : "Track work across the board in a three-column kanban view."}
        </p>
      </header>
      <div className="mt-5">
        <BoardTabs boardId={board.id} activeTab="tasks" />
      </div>
      <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]">
        <TaskBoardShell board={board} viewer={viewer} />
      </div>
      <FloatingCreateTaskButton disabled={board.archivedAt !== null} />
    </div>
  );
}
