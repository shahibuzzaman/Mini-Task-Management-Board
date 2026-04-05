import { BoardPageShell } from "@/components/board/board-page-shell";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { getBoardShellData } from "@/features/boards/lib/get-board-shell-data";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

type BoardPageProps = {
  searchParams: Promise<{
    boardId?: string;
  }>;
};

export default async function BoardPage({ searchParams }: BoardPageProps) {
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

  const { boardId } = await searchParams;
  const { viewer, boards, board, redirectBoardId } = await getBoardShellData(boardId);

  if (redirectBoardId && redirectBoardId !== boardId) {
    redirect(`/board?boardId=${redirectBoardId}`);
  }

  return <BoardPageShell viewer={viewer} boards={boards} board={board} />;
}
