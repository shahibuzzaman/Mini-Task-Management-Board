"use client";

import { BoardTabs } from "@/components/board/board-tabs";
import { useBoardSettingsController } from "@/features/boards/hooks/use-board-settings-controller";
import type { BoardSummary } from "@/features/boards/types/board";
import type {
  BoardAccentColor,
  BoardInvitePolicy,
  BoardInviteRole,
} from "@/types/database";

type BoardDetailsPageProps = {
  board: BoardSummary;
};

const ACCENT_OPTIONS: Array<{
  value: BoardAccentColor;
  label: string;
  colorClassName: string;
}> = [
  { value: "sky", label: "Sky", colorClassName: "bg-sky-500" },
  { value: "emerald", label: "Emerald", colorClassName: "bg-emerald-500" },
  { value: "amber", label: "Amber", colorClassName: "bg-amber-500" },
  { value: "rose", label: "Rose", colorClassName: "bg-rose-500" },
  { value: "slate", label: "Slate", colorClassName: "bg-slate-500" },
];

const INVITE_POLICY_OPTIONS: Array<{
  value: BoardInvitePolicy;
  label: string;
}> = [
  { value: "admins_only", label: "Only admins can invite" },
  { value: "members", label: "Members can invite too" },
];

const DEFAULT_ROLE_OPTIONS: Array<{
  value: BoardInviteRole;
  label: string;
}> = [
  { value: "member", label: "Contributor" },
  { value: "admin", label: "Admin" },
];

export function BoardDetailsPage({ board }: BoardDetailsPageProps) {
  const {
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
    hasChanges,
    invitePolicy,
    name,
    setAccentColor,
    setBoardPinMutation,
    setDefaultInviteRole,
    setDescription,
    setInvitePolicy,
    setName,
    updateBoardMutation,
  } = useBoardSettingsController(board);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="text-[24px] font-bold text-slate-900">
          {board.name}
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Configure board settings, permissions, and workspace appearance.
        </p>
      </header>

      <div className="mt-5">
        <BoardTabs boardId={board.id} activeTab="settings" />
      </div>
      <div className="mt-8 overflow-hidden rounded-[1.5rem] bg-surface-container-lowest p-6 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.08)] sm:p-10 space-y-14">
        <SettingsSection
          title="Dashboard"
          description="Choose whether this board appears in your dashboard pinned boards list."
        >
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-[15px] font-semibold text-slate-900">
                {board.isPinned ? "Pinned to dashboard" : "Not pinned"}
              </p>
              <p className="mt-1 text-[14px] leading-6 text-slate-500">
                This preference only affects your dashboard view.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleTogglePin()}
              disabled={setBoardPinMutation.isPending}
              className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-[14px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                board.isPinned
                  ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {setBoardPinMutation.isPending
                ? "Saving..."
                : board.isPinned
                  ? "Unpin Board"
                  : "Pin Board"}
            </button>
          </div>
        </SettingsSection>

        <SettingsSection
          title="General"
          description="Basic identification for this project board."
        >
          <div className="space-y-6">
            <Field label="Board Name">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!canEditSettings || updateBoardMutation.isPending}
                className="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3.5 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={!canEditSettings || updateBoardMutation.isPending}
                className="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3.5 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Appearance"
          description="Customize the visual identity of the workspace."
        >
          <Field label="Accent Color">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3 border border-transparent">
              {ACCENT_OPTIONS.map((option) => {
                const isActive = accentColor === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAccentColor(option.value)}
                    disabled={!canEditSettings || updateBoardMutation.isPending}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                      isActive
                        ? "border-[#4f46e5] ring-2 ring-[#4f46e5]/20"
                        : "border-transparent"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                    aria-label={`Select ${option.label} accent color`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${option.colorClassName} text-white`}
                    >
                      {isActive ? (
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>
        </SettingsSection>

        <SettingsSection
          title="Permissions"
          description="Control access levels and member invitation policies."
        >
          <div className="space-y-6">
            <Field label="Invite Policy">
              <select
                value={invitePolicy}
                onChange={(event) =>
                  setInvitePolicy(event.target.value as BoardInvitePolicy)
                }
                disabled={!canEditSettings || updateBoardMutation.isPending}
                className="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3.5 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
              >
                {INVITE_POLICY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Default Role">
              <select
                value={defaultInviteRole}
                onChange={(event) =>
                  setDefaultInviteRole(event.target.value as BoardInviteRole)
                }
                disabled={!canEditSettings || updateBoardMutation.isPending}
                className="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3.5 text-[14px] text-slate-800 outline-none transition focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
              >
                {DEFAULT_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            {canEditSettings ? (
              <div className="flex items-center justify-end gap-6 pt-4">
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  disabled={!hasChanges || updateBoardMutation.isPending}
                  className="text-[15px] font-bold text-primary transition hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={
                    !hasChanges ||
                    updateBoardMutation.isPending ||
                    name.trim().length < 2
                  }
                  className="rounded-xl bg-primary px-8 py-3.5 text-[15px] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
                >
                  {updateBoardMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : null}
          </div>
        </SettingsSection>

        {canManageLifecycle || canRemoveBoard ? (
          <SettingsSection
            title="Danger Zone"
            titleClassName="text-rose-700"
            description="Irreversible actions that affect the entire project board."
          >
            <div className="rounded-2xl border border-rose-100 bg-rose-50/60">
              {canManageLifecycle ? (
                <DangerRow
                  title="Archive Board"
                  description="Remove from active projects. Can be restored later."
                  actionLabel={board.archivedAt ? "Unarchive" : "Archive"}
                  actionTone="secondary"
                  disabled={updateBoardMutation.isPending}
                  onAction={() => void handleArchiveToggle()}
                />
              ) : null}
              {canRemoveBoard ? (
                <DangerRow
                  title="Delete Board"
                  description="Permanently delete all data. This cannot be undone."
                  actionLabel={deleteBoardMutation.isPending ? "Deleting..." : "Delete Board"}
                  actionTone="danger"
                  disabled={deleteBoardMutation.isPending}
                  onAction={() => void handleDeleteBoard()}
                />
              ) : null}
            </div>
          </SettingsSection>
        ) : null}
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  titleClassName,
  children,
}: {
  title: string;
  description: string;
  titleClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <div>
        <h2 className={`text-[22px] font-bold text-slate-800 ${titleClassName ?? ""}`}>
          {title}
        </h2>
        <p className="mt-2 max-w-xs text-[14px] leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5e718d]">
        {label}
      </span>
      <div className="mt-3">{children}</div>
    </label>
  );
}

function DangerRow({
  title,
  description,
  actionLabel,
  actionTone,
  disabled,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionTone: "secondary" | "danger";
  disabled: boolean;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-rose-100 px-6 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          actionTone === "danger"
            ? "bg-rose-600 text-white hover:bg-rose-700"
            : "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}
