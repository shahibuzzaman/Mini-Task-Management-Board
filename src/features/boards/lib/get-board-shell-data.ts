import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";

type ProfileRow = {
  display_name: string | null;
};

type BoardRow = {
  id: string;
  name: string;
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

  const { data: ensuredBoardId, error: ensureBoardError } = await supabase.rpc(
    "ensure_current_user_shared_board",
  );

  if (ensureBoardError || !ensuredBoardId) {
    throw new Error(
      ensureBoardError?.message ?? "Unable to prepare the shared board.",
    );
  }

  const [{ data: profile, error: profileError }, { data: board, error: boardError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single<ProfileRow>(),
      supabase
        .from("boards")
        .select("id, name")
        .eq("id", ensuredBoardId)
        .single<BoardRow>(),
    ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (boardError) {
    throw new Error(boardError.message);
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
