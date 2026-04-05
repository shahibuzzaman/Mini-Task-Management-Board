import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";

type ProfileRow = {
  display_name: string | null;
};

export type BoardShellData = {
  viewer: AuthViewer;
  board: BoardSummary;
};

export async function getBoardShellData(): Promise<BoardShellData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/auth");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/auth");
  }

  const [{ data: profile, error: profileError }, board] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single<ProfileRow>(),
    getCurrentBoardAccess(supabase, user.id),
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    viewer: {
      id: user.id,
      email: user.email,
      displayName: profile.display_name ?? user.email.split("@")[0] ?? "User",
    },
    board,
  };
}
