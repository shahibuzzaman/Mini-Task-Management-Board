import { requestJson } from "@/lib/query/request-json";

export async function removeBoardMember(userId: string): Promise<void> {
  await requestJson<null>(`/api/board-members/${userId}`, {
    method: "DELETE",
  });
}
