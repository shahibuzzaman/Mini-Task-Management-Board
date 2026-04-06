"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setBoardPin } from "@/features/boards/api/set-board-pin";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardSummary } from "@/features/boards/types/board";

export function useSetBoardPinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, isPinned }: { boardId: string; isPinned: boolean }) =>
      setBoardPin(boardId, isPinned),
    onMutate: async ({ boardId, isPinned }) => {
      await queryClient.cancelQueries({ queryKey: boardsQueryKeys.list() });

      const previousBoards =
        queryClient.getQueryData<BoardSummary[]>(boardsQueryKeys.list()) ?? null;

      if (previousBoards) {
        queryClient.setQueryData<BoardSummary[]>(
          boardsQueryKeys.list(),
          [...previousBoards]
            .map((board) =>
              board.id === boardId ? { ...board, isPinned } : board,
            )
            .sort((left, right) => {
              if (left.isPinned === right.isPinned) {
                return 0;
              }

              return left.isPinned ? -1 : 1;
            }),
        );
      }

      return { previousBoards };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousBoards) {
        queryClient.setQueryData(boardsQueryKeys.list(), context.previousBoards);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: boardsQueryKeys.list() });
    },
  });
}
