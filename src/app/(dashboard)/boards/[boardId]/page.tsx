import { BoardTasksPage } from "@/components/board/board-tasks-page";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { getBoardShellData } from "@/features/boards/lib/get-board-shell-data";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import { redirect } from "next/navigation";

type BoardPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
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
  const { viewer, board, redirectBoardId } = await getBoardShellData(boardId);

  if (redirectBoardId && redirectBoardId !== boardId) {
    redirect(`/boards/${redirectBoardId}`);
  }

  if (!board) {
    redirect("/boards");
  }

  return (
    <BoardTasksPage board={board} viewer={viewer} />
  );
}
