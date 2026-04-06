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
  isPinned: boolean;
  accentColor: BoardAccentColor;
  invitePolicy: BoardInvitePolicy;
  defaultInviteRole: BoardInviteRole;
  currentUserRole: BoardRole;
};
