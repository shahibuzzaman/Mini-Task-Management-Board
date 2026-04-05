import type { BoardRole } from "@/types/database";

export type BoardSummary = {
  id: string;
  name: string;
  currentUserRole: BoardRole;
};
