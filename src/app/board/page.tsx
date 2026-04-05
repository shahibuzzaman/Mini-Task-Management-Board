import { BoardPageShell } from "@/components/board/board-page-shell";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { getBoardShellData } from "@/features/boards/lib/get-board-shell-data";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

export default async function BoardPage() {
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

  const { viewer, board } = await getBoardShellData();

  return <BoardPageShell viewer={viewer} board={board} />;
}
