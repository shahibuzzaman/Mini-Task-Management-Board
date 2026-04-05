import type {
  BoardAccentColor,
  BoardInvitePolicy,
  BoardInviteRole,
  BoardRole,
} from "@/types/database";

export type BoardSummary = {
  id: string;
  name: string;
  description: string;
  archivedAt: string | null;
  accentColor: BoardAccentColor;
  invitePolicy: BoardInvitePolicy;
  defaultInviteRole: BoardInviteRole;
  currentUserRole: BoardRole;
};
