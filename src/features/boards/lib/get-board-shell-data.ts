import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import { ensureCurrentUserProfile } from "@/features/boards/lib/ensure-current-user-profile";
import { getAccessibleBoards } from "@/features/boards/lib/get-accessible-boards";

type ProfileRow = {
  display_name: string | null;
};

export type BoardShellData = {
  viewer: AuthViewer;
  boards: BoardSummary[];
  board: BoardSummary | null;
  redirectBoardId: string | null;
};

export async function getBoardShellData(
  requestedBoardId?: string,
): Promise<BoardShellData> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/signin");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/signin");
  }

  const [, { data: profile, error: profileError }, boards] = await Promise.all([
    ensureCurrentUserProfile(supabase),
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single<ProfileRow>(),
    getAccessibleBoards(supabase, user.id),
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const board =
    (requestedBoardId
      ? boards.find((candidate) => candidate.id === requestedBoardId)
      : undefined) ??
    boards[0] ??
    null;

  return {
    viewer: {
      id: user.id,
      email: user.email,
      displayName: profile.display_name ?? user.email.split("@")[0] ?? "User",
    },
    boards,
    board,
    redirectBoardId:
      board && board.id !== (requestedBoardId ?? "") ? board.id : null,
  };
}
