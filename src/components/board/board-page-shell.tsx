import { AccountSummary } from "@/features/auth/components/account-summary";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import { BoardMembersPanel } from "@/components/board/board-members-panel";
import { TaskBoardShell } from "@/components/board/task-board-shell";

type BoardPageShellProps = {
  viewer: AuthViewer;
  board: BoardSummary;
};

export function BoardPageShell({ viewer, board }: BoardPageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-8">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Authenticated Board
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {board.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Supabase Auth owns the verified user session. TanStack Query owns
            board data. Zustand owns only board UI state such as modal visibility
            and the active editing task.
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
          <TaskBoardShell board={board} viewer={viewer} />

          <aside className="space-y-6">
            <AccountSummary viewer={viewer} />
            <BoardMembersPanel board={board} viewer={viewer} />
          </aside>
        </div>
      </div>
    </main>
  );
}
