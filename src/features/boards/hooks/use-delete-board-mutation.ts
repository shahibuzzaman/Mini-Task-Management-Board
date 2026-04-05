"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBoard } from "@/features/boards/api/delete-board";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardSummary } from "@/features/boards/types/board";

export function useDeleteBoardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: (_data, boardId) => {
      queryClient.setQueryData<BoardSummary[] | undefined>(
        boardsQueryKeys.list(),
        (currentBoards) =>
          currentBoards?.filter((board) => board.id !== boardId),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardsQueryKeys.list(),
      });
    },
  });
}
