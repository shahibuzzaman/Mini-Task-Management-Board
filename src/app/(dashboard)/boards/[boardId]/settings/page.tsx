import { BoardDetailsPage } from "@/components/board/board-details-page";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { getBoardSectionPath } from "@/features/boards/lib/board-routes";
import { getBoardShellData } from "@/features/boards/lib/get-board-shell-data";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

type BoardSettingsPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardSettingsPage({
  params,
}: BoardSettingsPageProps) {
  const { boardId } = await params;
  const config = getSupabaseBrowserConfig();

  if (!config.isConfigured) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-10 sm:px-8">
        <SupabaseSetupNotice
          isConfigured={config.isConfigured}
          missingEnvVars={config.missingEnvVars}
        />
      </main>
    );
  }

  const { board, redirectBoardId } = await getBoardShellData(boardId);

  if (redirectBoardId && redirectBoardId !== boardId) {
    redirect(getBoardSectionPath(redirectBoardId, "settings"));
  }

  if (!board) {
    redirect("/boards");
  }

  return (
    <BoardDetailsPage
      key={`${board.id}-${board.name}-${board.accentColor}-${board.invitePolicy}-${board.defaultInviteRole}-${board.archivedAt ?? "active"}`}
      board={board}
    />
  );
}
