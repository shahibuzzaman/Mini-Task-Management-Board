import { AccountSummary } from "@/features/auth/components/account-summary";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import { BoardSettingsPanel } from "@/components/board/board-settings-panel";
import { BoardInvitationsPanel } from "@/components/board/board-invitations-panel";
import { BoardMembersPanel } from "@/components/board/board-members-panel";
import { BoardsPanel } from "@/components/board/boards-panel";
import { TaskBoardShell } from "@/components/board/task-board-shell";

type BoardPageShellProps = {
  viewer: AuthViewer;
  boards: BoardSummary[];
  board: BoardSummary | null;
};

export function BoardPageShell({ viewer, boards, board }: BoardPageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-8">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Authenticated Workspace
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            {board ? board.name : "Your Boards"}
          </h1>
          {board?.archivedAt ? (
            <p className="mt-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
              Archived board
            </p>
          ) : null}
          <p className="mt-4 text-base leading-7 text-slate-600">
            {board?.description?.length ? `${board.description} ` : ""}
            Supabase Auth owns the verified user session. TanStack Query owns
            board and task data. Zustand owns only board UI state such as modal
            visibility and the active editing task.
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
          {board ? (
            <TaskBoardShell board={board} viewer={viewer} />
          ) : (
            <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-950">
                Create your first board
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Boards are the collaboration container in this app. Create one
                from the sidebar, then invite members and start creating tasks.
              </p>
            </section>
          )}

          <aside className="space-y-6">
            <AccountSummary viewer={viewer} />
            <BoardsPanel boards={boards} activeBoardId={board?.id ?? null} />
            {board ? <BoardSettingsPanel key={board.id} board={board} /> : null}
            {board ? <BoardInvitationsPanel board={board} /> : null}
            {board ? <BoardMembersPanel board={board} viewer={viewer} /> : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
