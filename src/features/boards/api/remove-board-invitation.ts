import { requestJson } from "@/lib/query/request-json";

export async function removeBoardInvitation(
  boardId: string,
  invitationId: string,
): Promise<void> {
  await requestJson<null>(
    `/api/board-invitations/${invitationId}?boardId=${boardId}`,
    {
      method: "DELETE",
    },
  );
}
