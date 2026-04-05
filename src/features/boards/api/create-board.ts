import { requestJson } from "@/lib/query/request-json";
import type { BoardSummary } from "@/features/boards/types/board";
import type {
  BoardAccentColor,
  BoardInvitePolicy,
  BoardInviteRole,
} from "@/types/database";

export type CreateBoardInput = {
  name: string;
  description?: string;
  accentColor?: BoardAccentColor;
  invitePolicy?: BoardInvitePolicy;
  defaultInviteRole?: BoardInviteRole;
};

export async function createBoard(input: CreateBoardInput): Promise<BoardSummary> {
  return requestJson<BoardSummary>("/api/boards", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
