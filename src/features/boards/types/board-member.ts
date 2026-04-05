import type { BoardRole } from "@/types/database";

export type BoardMember = {
  userId: string;
  displayName: string;
  email: string;
  role: BoardRole;
  isCurrentUser: boolean;
};
