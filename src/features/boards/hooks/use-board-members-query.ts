"use client";

import { useQuery } from "@tanstack/react-query";
import { getBoardMembers } from "@/features/boards/api/get-board-members";
import { boardsQueryKeys } from "@/features/boards/query-keys";

export function useBoardMembersQuery(boardId: string) {
  return useQuery({
    queryKey: boardsQueryKeys.members(boardId),
    queryFn: getBoardMembers,
    enabled: boardId.length > 0,
  });
}
