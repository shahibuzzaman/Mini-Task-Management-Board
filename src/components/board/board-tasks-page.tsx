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
    <div className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          {board.name}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          {board.description.length > 0
            ? board.description
            : "Track work across the board in a three-column kanban view."}
        </p>
      </header>
      <div className="mt-8">
        <BoardTabs boardId={board.id} activeTab="tasks" />
      </div>
      <div className="mt-8">
        <TaskBoardShell board={board} viewer={viewer} />
      </div>
      <FloatingCreateTaskButton disabled={board.archivedAt !== null} />
    </div>
  );
}
