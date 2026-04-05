import { redirect } from "next/navigation";
import { BoardWorkspacePage } from "@/components/board/board-workspace-page";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { getBoardSectionPath } from "@/features/boards/lib/board-routes";
import { getBoardShellData } from "@/features/boards/lib/get-board-shell-data";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

type BoardInvitationsPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardInvitationsPage({
  params,
}: BoardInvitationsPageProps) {
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

  const { boardId } = await params;
  const { viewer, boards, board, redirectBoardId } = await getBoardShellData(boardId);

  if (redirectBoardId && redirectBoardId !== boardId) {
    redirect(getBoardSectionPath(redirectBoardId, "invitations"));
  }

  return (
    <BoardWorkspacePage
      viewer={viewer}
      boards={boards}
      board={board}
      section="invitations"
    />
  );
}
