"use client";

import { useQuery } from "@tanstack/react-query";
import { getBoards } from "@/features/boards/api/get-boards";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardSummary } from "@/features/boards/types/board";

export function useBoardsQuery(initialBoards: BoardSummary[]) {
  return useQuery({
    queryKey: boardsQueryKeys.list(),
    queryFn: getBoards,
    initialData: initialBoards,
  });
}
