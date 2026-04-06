"use client";

type BoardInviteFormProps = {
  inviteEmail: string;
  inviteRole: "admin" | "member";
  canInviteMembers: boolean;
  canReviewInvitations: boolean;
  defaultInviteRole: "admin" | "member";
  isSubmitting: boolean;
  onInviteEmailChange: (value: string) => void;
  onInviteRoleChange: (value: "admin" | "member") => void;
  onSubmit: () => void;
};

export function BoardInviteForm({
  inviteEmail,
  inviteRole,
  canInviteMembers,
  canReviewInvitations,
  defaultInviteRole,
  isSubmitting,
  onInviteEmailChange,
  onInviteRoleChange,
  onSubmit,
}: BoardInviteFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit();
  }

  return (
    <form
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_10rem_10rem]"
      onSubmit={handleSubmit}
    >
      <label className="relative block">
        <span className="sr-only">Invite email</span>
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M4 6h16v12H4z" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </span>
        <input
          type="email"
          autoComplete="email"
          value={inviteEmail}
          onChange={(event) => onInviteEmailChange(event.target.value)}
          placeholder="Enter colleague's email address..."
          disabled={!canInviteMembers || isSubmitting}
          className="w-full rounded-xl border border-transparent bg-surface-container-low py-3.5 pl-14 pr-4 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
        />
      </label>

      <select
        value={canReviewInvitations ? inviteRole : defaultInviteRole}
        onChange={(event) =>
          onInviteRoleChange(event.target.value as "admin" | "member")
        }
        disabled={!canInviteMembers || !canReviewInvitations || isSubmitting}
        className="rounded-xl border border-transparent bg-surface-container-low px-4 py-3.5 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>

      <button
        type="submit"
        disabled={!canInviteMembers || inviteEmail.trim().length === 0}
        className="rounded-xl bg-primary px-6 py-3.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
      >
        {isSubmitting ? "Adding..." : "Add Member"}
      </button>
    </form>
  );
}
