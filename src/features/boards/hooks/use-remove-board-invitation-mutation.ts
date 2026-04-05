"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeBoardInvitation } from "@/features/boards/api/remove-board-invitation";
import { boardsQueryKeys } from "@/features/boards/query-keys";
import type { BoardInvitation } from "@/features/boards/types/board-invitation";

export function useRemoveBoardInvitationMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      removeBoardInvitation(boardId, invitationId),
    onSuccess: (_data, invitationId) => {
      queryClient.setQueryData<BoardInvitation[] | undefined>(
        boardsQueryKeys.invitations(boardId),
        (currentInvitations) =>
          currentInvitations?.filter(
            (invitation) => invitation.id !== invitationId,
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
