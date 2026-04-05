"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addBoardMember,
  type AddBoardMemberInput,
} from "@/features/boards/api/add-board-member";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardMember } from "@/features/boards/types/board-member";

export function useAddBoardMemberMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddBoardMemberInput) => addBoardMember(input),
    onSuccess: (member) => {
      queryClient.setQueryData<BoardMember[] | undefined>(
        boardsQueryKeys.members(boardId),
        (currentMembers) => {
          if (!currentMembers) {
            return currentMembers;
          }

          return currentMembers.some(
            (currentMember) => currentMember.userId === member.userId,
          )
            ? currentMembers
            : [...currentMembers, member];
        },
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardsQueryKeys.members(boardId),
      });
    },
  });
}
