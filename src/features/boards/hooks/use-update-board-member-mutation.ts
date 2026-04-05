"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBoardMember,
  type UpdateBoardMemberInput,
} from "@/features/boards/api/update-board-member";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardMember } from "@/features/boards/types/board-member";

export function useUpdateBoardMemberMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateBoardMemberInput) => updateBoardMember(input),
    onSuccess: (updatedMember) => {
      queryClient.setQueryData<BoardMember[] | undefined>(
        boardsQueryKeys.members(boardId),
        (currentMembers) =>
          currentMembers?.map((member) =>
            member.userId === updatedMember.userId ? updatedMember : member,
          ),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardsQueryKeys.members(boardId),
      });
    },
  });
}
