"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBoardInvitation,
  type CreateBoardInvitationResult,
  type CreateBoardInvitationInput,
} from "@/features/boards/api/create-board-invitation";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardMember } from "@/features/boards/types/board-member";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";

export function useCreateBoardInvitationMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: Omit<CreateBoardInvitationInput, "boardId">,
    ) => createBoardInvitation({ ...input, boardId }),
    onSuccess: (result: CreateBoardInvitationResult) => {
      if (result.type === "invitation_sent") {
        queryClient.setQueryData<BoardInvitation[] | undefined>(
          boardsQueryKeys.invitations(boardId),
          (currentInvitations) =>
            currentInvitations
              ? [result.invitation, ...currentInvitations]
              : [result.invitation],
        );
      }

      if (result.type === "member_added") {
        queryClient.setQueryData<BoardMember[] | undefined>(
          boardsQueryKeys.members(boardId),
          (currentMembers) =>
            currentMembers ? [result.member, ...currentMembers] : [result.member],
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardsQueryKeys.members(boardId),
      });
      await queryClient.invalidateQueries({
        queryKey: boardsQueryKeys.invitations(boardId),
      });
    },
  });
}
