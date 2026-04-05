import { requestJson } from "@/lib/query/request-json";

export async function removeBoardMember(
  boardId: string,
  userId: string,
): Promise<void> {
  await requestJson<null>(`/api/board-members/${userId}?boardId=${boardId}`, {
    method: "DELETE",
  });
}
