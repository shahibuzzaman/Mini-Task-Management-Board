import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardMember } from "@/features/boards/types/board-member";
import type { Database } from "@/types/database";

export type BoardMemberRecord = Database["public"]["Tables"]["board_members"]["Row"] & {
  profile: {
    display_name: string | null;
    email: string;
  } | null;
};

export function mapBoardMemberRowToBoardMember(
  row: BoardMemberRecord,
  viewer: Pick<AuthViewer, "id">,
): BoardMember {
  return {
    userId: row.user_id,
    displayName: row.profile?.display_name ?? row.profile?.email ?? "Unknown user",
    email: row.profile?.email ?? "",
    role: row.role,
    isCurrentUser: row.user_id === viewer.id,
  };
}
