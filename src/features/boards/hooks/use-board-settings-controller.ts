"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBoardMembersQuery } from "@/features/boards/hooks/use-board-members-query";
import {
  canDeleteBoard,
  canManageBoardLifecycle,
  canManageBoardSettings,
} from "@/features/boards/lib/board-permissions";
import { getBoardsPath } from "@/features/boards/lib/board-routes";
import { useDeleteBoardMutation } from "@/features/boards/hooks/use-delete-board-mutation";
import { useSetBoardPinMutation } from "@/features/boards/hooks/use-set-board-pin-mutation";
import { useTransferBoardOwnershipMutation } from "@/features/boards/hooks/use-transfer-board-ownership-mutation";
import { useUpdateBoardMutation } from "@/features/boards/hooks/use-update-board-mutation";
import type { BoardSummary } from "@/features/boards/types/board";
import type {
  BoardAccentColor,
  BoardInvitePolicy,
  BoardInviteRole,
} from "@/types/database";
import { useToast } from "@/store/use-toast";

export function useBoardSettingsController(board: BoardSummary) {
  const router = useRouter();
  const membersQuery = useBoardMembersQuery(board.id);
  const updateBoardMutation = useUpdateBoardMutation();
  const setBoardPinMutation = useSetBoardPinMutation();
  const transferOwnershipMutation = useTransferBoardOwnershipMutation();
  const deleteBoardMutation = useDeleteBoardMutation();
  const showToast = useToast();
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description);
  const [accentColor, setAccentColor] = useState<BoardAccentColor>(board.accentColor);
  const [invitePolicy, setInvitePolicy] = useState<BoardInvitePolicy>(board.invitePolicy);
  const [defaultInviteRole, setDefaultInviteRole] =
    useState<BoardInviteRole>(board.defaultInviteRole);
  const [targetOwnerId, setTargetOwnerId] = useState("");
  const canEditSettings = canManageBoardSettings(board.currentUserRole);
  const canManageLifecycle = canManageBoardLifecycle(board.currentUserRole);
  const canRemoveBoard = canDeleteBoard(board.currentUserRole);

  const transferableMembers = useMemo(
    () => (membersQuery.data ?? []).filter((member) => !member.isCurrentUser),
    [membersQuery.data],
  );

  const hasChanges = useMemo(
    () =>
      name.trim() !== board.name ||
      description.trim() !== board.description ||
      accentColor !== board.accentColor ||
      invitePolicy !== board.invitePolicy ||
      defaultInviteRole !== board.defaultInviteRole,
    [
      accentColor,
      board.accentColor,
      board.defaultInviteRole,
      board.description,
      board.invitePolicy,
      board.name,
      defaultInviteRole,
      description,
      invitePolicy,
      name,
    ],
  );

  async function handleSave() {
    try {
      await updateBoardMutation.mutateAsync({
        boardId: board.id,
        name: name.trim(),
        description: description.trim(),
        accentColor,
        invitePolicy,
        defaultInviteRole,
      });
      showToast("success", "Board settings updated.");
      router.refresh();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to update board settings.",
      );
    }
  }

  function handleDiscardChanges() {
    setName(board.name);
    setDescription(board.description);
    setAccentColor(board.accentColor);
    setInvitePolicy(board.invitePolicy);
    setDefaultInviteRole(board.defaultInviteRole);
  }

  async function handleArchiveToggle() {
    try {
      await updateBoardMutation.mutateAsync({
        boardId: board.id,
        name: name.trim(),
        description: description.trim(),
        accentColor,
        invitePolicy,
        defaultInviteRole,
        archivedAt: board.archivedAt ? null : new Date().toISOString(),
      });
      showToast(
        "success",
        board.archivedAt ? "Board unarchived." : "Board archived.",
      );
      router.refresh();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to update archive state.",
      );
    }
  }

  async function handleTogglePin() {
    try {
      await setBoardPinMutation.mutateAsync({
        boardId: board.id,
        isPinned: !board.isPinned,
      });
      showToast(
        "success",
        board.isPinned ? "Board removed from dashboard." : "Board pinned to dashboard.",
      );
      router.refresh();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to update board pin.",
      );
    }
  }

  async function handleTransferOwnership() {
    if (targetOwnerId.length === 0) {
      return;
    }

    try {
      await transferOwnershipMutation.mutateAsync({
        boardId: board.id,
        targetUserId: targetOwnerId,
      });
      showToast("success", "Board ownership transferred.");
      router.refresh();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to transfer ownership.",
      );
    }
  }

  async function handleDeleteBoard() {
    const confirmed = window.confirm(
      "Delete this board? This will permanently remove its tasks, members, and invitations.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBoardMutation.mutateAsync(board.id);
      showToast("success", "Board deleted.");
      router.replace(getBoardsPath());
      router.refresh();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to delete the board.",
      );
    }
  }

  return {
    accentColor,
    canEditSettings,
    canManageLifecycle,
    canRemoveBoard,
    defaultInviteRole,
    deleteBoardMutation,
    description,
    handleArchiveToggle,
    handleDeleteBoard,
    handleDiscardChanges,
    handleSave,
    handleTogglePin,
    handleTransferOwnership,
    hasChanges,
    invitePolicy,
    membersQuery,
    name,
    setAccentColor,
    setBoardPinMutation,
    setDefaultInviteRole,
    setDescription,
    setInvitePolicy,
    setName,
    setTargetOwnerId,
    targetOwnerId,
    transferOwnershipMutation,
    transferableMembers,
    updateBoardMutation,
  };
}
