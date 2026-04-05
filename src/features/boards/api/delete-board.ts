import { requestJson } from "@/lib/query/request-json";

export async function deleteBoard(boardId: string): Promise<void> {
  await requestJson<null>(`/api/boards/${boardId}`, {
    method: "DELETE",
  });
}
