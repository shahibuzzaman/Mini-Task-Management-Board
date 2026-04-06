"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BoardTabs } from "@/components/board/board-tabs";
import { getBoardsPath } from "@/features/boards/lib/board-routes";
import {
  canManageBoardLifecycle,
  canManageBoardSettings,
} from "@/features/boards/lib/board-permissions";
import { useDeleteBoardMutation } from "@/features/boards/hooks/use-delete-board-mutation";
import { useUpdateBoardMutation } from "@/features/boards/hooks/use-update-board-mutation";
import type { BoardSummary } from "@/features/boards/types/board";
import type {
  BoardAccentColor,
  BoardInvitePolicy,
  BoardInviteRole,
} from "@/types/database";
import { useToast } from "@/store/use-toast";

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
  const router = useRouter();
  const updateBoardMutation = useUpdateBoardMutation();
  const deleteBoardMutation = useDeleteBoardMutation();
  const canEditSettings = canManageBoardSettings(board.currentUserRole);
  const canManageLifecycle = canManageBoardLifecycle(board.currentUserRole);
  const showToast = useToast();
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description);
  const [accentColor, setAccentColor] = useState<BoardAccentColor>(board.accentColor);
  const [invitePolicy, setInvitePolicy] = useState<BoardInvitePolicy>(board.invitePolicy);
  const [defaultInviteRole, setDefaultInviteRole] =
    useState<BoardInviteRole>(board.defaultInviteRole);

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

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-8">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          {board.name}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Configure board settings, permissions, and workspace appearance.
        </p>
      </header>

      <div className="mt-8">
        <BoardTabs boardId={board.id} activeTab="settings" />
      </div>
      <div className="mt-10 space-y-14">
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
                className="w-full rounded-xl bg-[#f4f6fc] px-4 py-4 text-sm font-medium text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-[#4f46e5]/25 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={!canEditSettings || updateBoardMutation.isPending}
                className="w-full rounded-xl bg-[#f4f6fc] px-4 py-4 text-sm font-medium text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-[#4f46e5]/25 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </Field>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Appearance"
          description="Customize the visual identity of the workspace."
        >
          <Field label="Accent Color">
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#f4f6fc] px-4 py-3">
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
                className="w-full rounded-xl bg-[#f4f6fc] px-4 py-4 text-sm font-semibold text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-[#4f46e5]/25 disabled:cursor-not-allowed disabled:opacity-70"
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
                className="w-full rounded-xl bg-[#f4f6fc] px-4 py-4 text-sm font-semibold text-slate-900 outline-none ring-1 ring-transparent transition focus:ring-[#4f46e5]/25 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {DEFAULT_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            {canEditSettings ? (
              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleDiscardChanges}
                  disabled={!hasChanges || updateBoardMutation.isPending}
                  className="text-sm font-semibold text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300"
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
                  className="rounded-xl bg-[#4f46e5] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(79,70,229,0.9)] transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-[#c7c3ff]"
                >
                  {updateBoardMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : null}
          </div>
        </SettingsSection>

        {canManageLifecycle ? (
          <SettingsSection
            title="Danger Zone"
            titleClassName="text-rose-700"
            description="Irreversible actions that affect the entire project board."
          >
            <div className="rounded-2xl border border-rose-100 bg-rose-50/60">
              <DangerRow
                title="Archive Board"
                description="Remove from active projects. Can be restored later."
                actionLabel={board.archivedAt ? "Unarchive" : "Archive"}
                actionTone="secondary"
                disabled={updateBoardMutation.isPending}
                onAction={() => void handleArchiveToggle()}
              />
              <DangerRow
                title="Delete Board"
                description="Permanently delete all data. This cannot be undone."
                actionLabel={deleteBoardMutation.isPending ? "Deleting..." : "Delete Board"}
                actionTone="danger"
                disabled={deleteBoardMutation.isPending}
                onAction={() => void handleDeleteBoard()}
              />
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
        <h2 className={`text-2xl font-semibold text-slate-900 ${titleClassName ?? ""}`}>
          {title}
        </h2>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
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
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
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
