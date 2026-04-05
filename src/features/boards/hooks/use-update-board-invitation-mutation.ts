"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateBoardInvitation,
  type UpdateBoardInvitationInput,
} from "@/features/boards/api/update-board-invitation";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";

export function useUpdateBoardInvitationMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: Omit<UpdateBoardInvitationInput, "boardId">,
    ) => updateBoardInvitation({ ...input, boardId }),
    onSuccess: (updatedInvitation) => {
      queryClient.setQueryData<BoardInvitation[] | undefined>(
        boardsQueryKeys.invitations(boardId),
        (currentInvitations) =>
          currentInvitations?.map((invitation) =>
            invitation.id === updatedInvitation.id ? updatedInvitation : invitation,
          ),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: boardsQueryKeys.invitations(boardId),
      });
    },
  });
}
