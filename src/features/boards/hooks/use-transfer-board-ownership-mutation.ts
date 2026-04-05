"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  transferBoardOwnership,
  type TransferBoardOwnershipInput,
} from "@/features/boards/api/transfer-board-ownership";
import { boardsQueryKeys } from "@/features/boards/query-keys";

export function useTransferBoardOwnershipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransferBoardOwnershipInput) =>
      transferBoardOwnership(input),
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: boardsQueryKeys.list() }),
        queryClient.invalidateQueries({
          queryKey: boardsQueryKeys.members(variables.boardId),
        }),
      ]);
    },
  });
}
