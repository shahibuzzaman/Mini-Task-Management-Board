"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBoardInvitation,
  type CreateBoardInvitationInput,
} from "@/features/boards/api/create-board-invitation";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";

export function useCreateBoardInvitationMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: Omit<CreateBoardInvitationInput, "boardId">,
    ) => createBoardInvitation({ ...input, boardId }),
    onSuccess: (invitation) => {
      queryClient.setQueryData<BoardInvitation[] | undefined>(
        boardsQueryKeys.invitations(boardId),
        (currentInvitations) =>
          currentInvitations ? [invitation, ...currentInvitations] : [invitation],
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardsQueryKeys.invitations(boardId),
      });
    },
  });
}
