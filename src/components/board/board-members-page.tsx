"use client";

import { BoardTabs } from "@/components/board/board-tabs";
import { BoardInvitationSentModal } from "@/features/boards/components/board-invitation-sent-modal";
import { BoardMembersSection } from "@/features/boards/components/board-members-section";
import { useBoardMembersController } from "@/features/boards/hooks/use-board-members-controller";
import type { BoardSummary } from "@/features/boards/types/board";
import type { AuthViewer } from "@/features/auth/types/viewer";

type BoardMembersPageProps = {
  board: BoardSummary;
  viewer: AuthViewer;
};

export function BoardMembersPage({ board }: BoardMembersPageProps) {
  const controller = useBoardMembersController({ board });

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
        <header className="max-w-3xl">
          <h1 className="text-[24px] font-bold text-slate-900">
            {board.name}
          </h1>
          <p className="mt-1 text-[13px] text-slate-500">
            Manage member access and invite collaborators to the board.
          </p>
        </header>

        <div className="mt-5">
          <BoardTabs boardId={board.id} activeTab="members" />
        </div>
        <BoardMembersSection
          members={controller.members}
          inviteEmail={controller.inviteEmail}
          inviteRole={controller.inviteRole}
          canManageMembers={controller.canManageMembers}
          canInviteMembers={controller.canInviteMembers}
          canReviewInvitations={controller.canReviewInvitations}
          defaultInviteRole={board.defaultInviteRole}
          isCreatingInvitation={controller.isCreatingInvitation}
          isMutatingMembers={controller.isMutatingMembers}
          onInviteEmailChange={controller.setInviteEmail}
          onInviteRoleChange={controller.setInviteRole}
          onInviteSubmit={controller.submitInvite}
          onRoleChange={controller.handleRoleChange}
          onRemoveMember={controller.handleRemoveMember}
        />
      </div>
      <BoardInvitationSentModal
        email={controller.invitationSentEmail}
        isOpen={controller.invitationSentEmail !== null}
        onClose={controller.closeInvitationSentModal}
      />
    </>
  );
}
