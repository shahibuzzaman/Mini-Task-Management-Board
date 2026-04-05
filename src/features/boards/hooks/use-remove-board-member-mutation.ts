"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeBoardMember } from "@/features/boards/api/remove-board-member";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardMember } from "@/features/boards/types/board-member";

export function useRemoveBoardMemberMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeBoardMember(boardId, userId),
    onSuccess: (_data, userId) => {
      queryClient.setQueryData<BoardMember[] | undefined>(
        boardsQueryKeys.members(boardId),
        (currentMembers) =>
          currentMembers?.filter((member) => member.userId !== userId),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardsQueryKeys.members(boardId),
      });
    },
  });
}
