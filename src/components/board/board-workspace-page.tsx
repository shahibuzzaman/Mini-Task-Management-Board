import { BoardAdminToolsPanel } from "@/components/board/board-admin-tools-panel";
import { AccountSummary } from "@/features/auth/components/account-summary";
import type { AuthViewer } from "@/features/auth/types/viewer";
import { getBoardTheme } from "@/features/boards/lib/board-theme";
import type { BoardSummary } from "@/features/boards/types/board";
import { BoardSettingsPanel } from "@/components/board/board-settings-panel";
import { BoardInvitationsPanel } from "@/components/board/board-invitations-panel";
import { BoardMembersPanel } from "@/components/board/board-members-panel";
import { BoardsPanel } from "@/components/board/boards-panel";
import { TaskBoardShell } from "@/components/board/task-board-shell";
import type { BoardSection } from "@/features/boards/lib/board-routes";

type BoardWorkspacePageProps = {
  viewer: AuthViewer;
  boards: BoardSummary[];
  board: BoardSummary | null;
  section: BoardSection;
};

function getSectionHeading(section: BoardSection) {
  switch (section) {
    case "members":
      return "Members";
    case "invitations":
      return "Invitations";
    case "settings":
      return "Settings";
    case "board":
    default:
      return "Board";
  }
}

function getSectionDescription(section: BoardSection) {
  switch (section) {
    case "members":
      return "Manage collaborators, roles, and board access for the current workspace.";
    case "invitations":
      return "Send invitation links, track pending access, and review invite activity.";
    case "settings":
      return "Tune collaboration settings, invite policy, archive state, and ownership controls.";
    case "board":
    default:
      return "Work inside the Kanban board with realtime task updates, drag-and-drop ordering, and scoped board collaboration.";
  }
}

function renderBoardSection(
  section: BoardSection,
  board: BoardSummary,
  viewer: AuthViewer,
) {
  switch (section) {
    case "members":
      return <BoardMembersPanel board={board} viewer={viewer} />;
    case "invitations":
      return (
        <BoardInvitationsPanel board={board} viewerEmail={viewer.email} />
      );
    case "settings":
      return (
        <div className="space-y-6">
          <BoardSettingsPanel board={board} />
          <BoardAdminToolsPanel board={board} />
        </div>
      );
    default:
      return <TaskBoardShell board={board} viewer={viewer} />;
  }
}

export function BoardWorkspacePage({
  viewer,
  boards,
  board,
  section,
}: BoardWorkspacePageProps) {
  const boardTheme = board ? getBoardTheme(board.accentColor) : null;
  const sectionHeading = getSectionHeading(section);
  const sectionDescription = getSectionDescription(section);

  return (
    <div className="w-full max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-10">
      <div className="flex flex-col gap-8">
        <header className="max-w-3xl">
          <p
            className={`text-sm font-semibold uppercase tracking-[0.24em] ${
              boardTheme?.accentTextClassName ?? "text-sky-700"
            }`}
          >
            Authenticated Workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {board ? `${board.name} · ${sectionHeading}` : "Your Boards"}
          </h1>
          {board?.archivedAt ? (
            <p className="mt-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
              Archived board
            </p>
          ) : boardTheme ? (
            <p
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${boardTheme.badgeClassName}`}
            >
              {board?.accentColor} workspace
            </p>
          ) : null}
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            {board?.description?.length ? `${board.description} ` : ""}
            {board ? sectionDescription : "Boards are the collaboration container in this app. Create one from the sidebar, then invite members and start creating tasks."}
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
          {board ? (
            renderBoardSection(section, board, viewer)
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
          </aside>
        </div>
      </div>
    </div>
  );
}
