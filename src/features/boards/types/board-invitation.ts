import type { BoardRole } from "@/types/database";

export type BoardInvitation = {
  id: string;
  boardId: string;
  email: string;
  role: BoardRole;
  invitedByName: string;
  invitedByEmail: string;
  invitedUserId: string | null;
  token: string;
  tokenExpiresAt: string;
  lastSentAt: string;
  createdAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
};
