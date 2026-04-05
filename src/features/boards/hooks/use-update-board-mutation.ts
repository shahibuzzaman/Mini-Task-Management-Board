"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBoard,
  type UpdateBoardInput,
} from "@/features/boards/api/update-board";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardSummary } from "@/features/boards/types/board";

export function useUpdateBoardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBoardInput) => updateBoard(input),
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData<BoardSummary[] | undefined>(
        boardsQueryKeys.list(),
        (currentBoards) =>
          currentBoards?.map((board) =>
            board.id === updatedBoard.id ? updatedBoard : board,
          ),
      );
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: boardsQueryKeys.list(),
        }),
        queryClient.invalidateQueries({
          queryKey: boardsQueryKeys.members(variables.boardId),
        }),
      ]);
    },
  });
}
