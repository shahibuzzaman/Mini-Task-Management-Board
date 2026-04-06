import { requestJson } from "@/lib/query/request-json";

type SetBoardPinResponse = {
  boardId: string;
  isPinned: boolean;
};

export async function setBoardPin(boardId: string, isPinned: boolean) {
  return requestJson<SetBoardPinResponse>(`/api/boards/${boardId}/pin`, {
    method: isPinned ? "POST" : "DELETE",
  });
}
