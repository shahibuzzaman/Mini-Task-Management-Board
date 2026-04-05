import type { BoardRole } from "@/types/database";

export type BoardSummary = {
  id: string;
  name: string;
  description: string;
  archivedAt: string | null;
  currentUserRole: BoardRole;
};
