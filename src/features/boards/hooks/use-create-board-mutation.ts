"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBoard,
  type CreateBoardInput,
} from "@/features/boards/api/create-board";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardSummary } from "@/features/boards/types/board";

export function useCreateBoardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBoardInput) => createBoard(input),
    onSuccess: (createdBoard) => {
      queryClient.setQueryData<BoardSummary[] | undefined>(
        boardsQueryKeys.list(),
        (currentBoards) =>
          currentBoards ? [...currentBoards, createdBoard] : [createdBoard],
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardsQueryKeys.list(),
      });
    },
  });
}
