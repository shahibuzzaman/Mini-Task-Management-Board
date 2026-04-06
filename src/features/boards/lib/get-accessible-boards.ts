import type { SupabaseClient } from "@supabase/supabase-js";
import type { BoardSummary } from "@/features/boards/types/board";
import type { Database } from "@/types/database";

type MembershipRow = {
  board_id: string;
  role: BoardSummary["currentUserRole"];
};

type PinRow = {
  board_id: string;
};

type BoardRow = {
  id: string;
  name: string;
  description: string;
  archived_at: string | null;
  accent_color: BoardSummary["accentColor"];
  invite_policy: BoardSummary["invitePolicy"];
  default_invitee_role: BoardSummary["defaultInviteRole"];
  created_at: string;
};

function isMissingBoardPinsTableError(message: string) {
  return message.includes("public.board_pins");
}

export async function getAccessibleBoards(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<BoardSummary[]> {
  const [
    { data: memberships, error: membershipsError },
    { data: boards, error: boardsError },
    { data: pins, error: pinsError },
  ] =
    await Promise.all([
      supabase
        .from("board_members")
        .select("board_id, role")
        .eq("user_id", userId)
        .returns<MembershipRow[]>(),
      supabase
        .from("boards")
        .select(
          "id, name, description, archived_at, accent_color, invite_policy, default_invitee_role, created_at",
        )
        .order("created_at", { ascending: true })
        .returns<BoardRow[]>(),
      supabase
        .from("board_pins")
        .select("board_id")
        .eq("user_id", userId)
        .returns<PinRow[]>(),
    ]);

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  if (boardsError) {
    throw new Error(boardsError.message);
  }

  if (pinsError && !isMissingBoardPinsTableError(pinsError.message)) {
    throw new Error(pinsError.message);
  }

  const roleByBoardId = new Map(
    (memberships ?? []).map((membership) => [membership.board_id, membership.role]),
  );
  const pinnedBoardIds = new Set(
    pinsError ? [] : (pins ?? []).map((pin) => pin.board_id),
  );

  return (boards ?? [])
    .filter((board) => roleByBoardId.has(board.id))
    .sort((left, right) => {
      const leftPinned = pinnedBoardIds.has(left.id);
      const rightPinned = pinnedBoardIds.has(right.id);

      if (leftPinned !== rightPinned) {
        return leftPinned ? -1 : 1;
      }

      return left.created_at.localeCompare(right.created_at);
    })
    .map((board) => ({
      id: board.id,
      name: board.name,
      description: board.description,
      archivedAt: board.archived_at,
      isPinned: pinnedBoardIds.has(board.id),
      accentColor: board.accent_color,
      invitePolicy: board.invite_policy,
      defaultInviteRole: board.default_invitee_role,
      currentUserRole: roleByBoardId.get(board.id) ?? "member",
    }));
}
