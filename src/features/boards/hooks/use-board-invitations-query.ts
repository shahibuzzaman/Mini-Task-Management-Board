"use client";

import { useQuery } from "@tanstack/react-query";
import { getBoardInvitations } from "@/features/boards/api/get-board-invitations";
import { boardsQueryKeys } from "@/features/boards/query-keys";

export function useBoardInvitationsQuery(boardId: string) {
  return useQuery({
    queryKey: boardsQueryKeys.invitations(boardId),
    queryFn: () => getBoardInvitations(boardId),
    enabled: boardId.length > 0,
  });
}
