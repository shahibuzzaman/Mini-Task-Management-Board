import { getBoardShellData } from "@/features/boards/lib/get-board-shell-data";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/board/supabase-setup-notice";
import { ProjectsOverview } from "@/features/dashboard/components/projects-overview";

export default async function DashboardPage() {
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

  // We omit requesting a specific board since we only need the aggregate dashboard data
  const { boards, viewer } = await getBoardShellData();

  return <ProjectsOverview boards={boards} viewer={viewer} />;
}
