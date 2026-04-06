"use client";

import { BoardMembersTable } from "@/components/board/board-members-table";
import { BoardInviteForm } from "@/features/boards/components/board-invite-form";
import type { BoardMember } from "@/features/boards/types/board-member";
import type { BoardRole } from "@/types/database";

type BoardMembersSectionProps = {
  members: BoardMember[];
  inviteEmail: string;
  inviteRole: "admin" | "member";
  canManageMembers: boolean;
  canInviteMembers: boolean;
  canReviewInvitations: boolean;
  defaultInviteRole: "admin" | "member";
  isCreatingInvitation: boolean;
  isMutatingMembers: boolean;
  onInviteEmailChange: (value: string) => void;
  onInviteRoleChange: (value: "admin" | "member") => void;
  onInviteSubmit: () => void;
  onRoleChange: (userId: string, role: BoardRole) => void;
  onRemoveMember: (userId: string) => void;
};

export function BoardMembersSection({
  members,
  inviteEmail,
  inviteRole,
  canManageMembers,
  canInviteMembers,
  canReviewInvitations,
  defaultInviteRole,
  isCreatingInvitation,
  isMutatingMembers,
  onInviteEmailChange,
  onInviteRoleChange,
  onInviteSubmit,
  onRoleChange,
  onRemoveMember,
}: BoardMembersSectionProps) {
  return (
    <section className="mt-8 overflow-hidden rounded-[1.5rem] bg-surface-container-lowest shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 p-4 sm:p-6">
        <BoardInviteForm
          inviteEmail={inviteEmail}
          inviteRole={inviteRole}
          canInviteMembers={canInviteMembers}
          canReviewInvitations={canReviewInvitations}
          defaultInviteRole={defaultInviteRole}
          isSubmitting={isCreatingInvitation}
          onInviteEmailChange={onInviteEmailChange}
          onInviteRoleChange={onInviteRoleChange}
          onSubmit={onInviteSubmit}
        />
      </div>

      <BoardMembersTable
        members={members}
        canManageMembers={canManageMembers}
        isMutating={isMutatingMembers}
        onRoleChange={onRoleChange}
        onRemoveMember={onRemoveMember}
      />
    </section>
  );
}
