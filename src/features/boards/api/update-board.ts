import { requestJson } from "@/lib/query/request-json";
import type { BoardSummary } from "@/features/boards/types/board";
import type {
  BoardAccentColor,
  BoardInvitePolicy,
  BoardInviteRole,
} from "@/types/database";

export type UpdateBoardInput = {
  boardId: string;
  name: string;
  description: string;
  accentColor: BoardAccentColor;
  invitePolicy: BoardInvitePolicy;
  defaultInviteRole: BoardInviteRole;
  archivedAt?: string | null;
};

export async function updateBoard(
  input: UpdateBoardInput,
): Promise<BoardSummary> {
  return requestJson<BoardSummary>(`/api/boards/${input.boardId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      accentColor: input.accentColor,
      invitePolicy: input.invitePolicy,
      defaultInviteRole: input.defaultInviteRole,
      archivedAt: input.archivedAt,
    }),
  });
}
