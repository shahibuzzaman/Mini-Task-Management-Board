"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InviteSignOutButton } from "@/components/board/invite-sign-out-button";
import { getBoardPath, getBoardsPath } from "@/features/boards/lib/board-routes";
import { requestJson } from "@/lib/query/request-json";
import { useToast } from "@/store/use-toast";

type InviteAcceptanceCardProps = {
  boardName: string;
  boardDescription: string;
  invitedEmail: string;
  role: "admin" | "member";
  token: string;
  status: "pending" | "accepted" | "revoked" | "expired";
  isAuthenticated: boolean;
  signedInEmail: string | null;
  hasExistingAccount: boolean;
};

export function InviteAcceptanceCard({
  boardName,
  boardDescription,
  invitedEmail,
  role,
  token,
  status,
  isAuthenticated,
  signedInEmail,
  hasExistingAccount,
}: InviteAcceptanceCardProps) {
  const router = useRouter();
  const showToast = useToast();
  const [isPending, setIsPending] = useState(false);

  const nextPath = `/invite/${token}`;
  const signedInEmailMatches =
    signedInEmail?.toLowerCase() === invitedEmail.toLowerCase();

  async function handleAccept() {
    setIsPending(true);

    try {
      const response = await requestJson<{ boardId: string; boardName: string }>(
        `/api/invitations/${token}`,
        {
          method: "POST",
        },
      );

      showToast("success", `Invitation accepted. Redirecting to ${response.boardName}.`);
      router.replace(getBoardPath(response.boardId));
      router.refresh();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to accept the invitation.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
        Board Invitation
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        Join {boardName}
      </h1>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        {boardDescription.length > 0
          ? `${boardDescription} `
          : ""}
        This invite is for <span className="font-semibold text-slate-950">{invitedEmail}</span> with the{" "}
        <span className="font-semibold uppercase tracking-[0.16em] text-slate-950">
          {role}
        </span>{" "}
        role.
      </p>
      {status === "accepted" ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
          This invitation has already been accepted.
          <div className="mt-4">
            <Link
              href={getBoardsPath()}
              className="inline-flex rounded-full border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-white"
            >
              Open boards
            </Link>
          </div>
        </div>
      ) : null}

      {status === "revoked" ? (
        <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
          This invitation has been revoked. Ask a board owner or admin to send a new one.
        </p>
      ) : null}

      {status === "expired" ? (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
          This invitation link has expired. Ask a board owner or admin to resend it.
        </p>
      ) : null}

      {status === "pending" && !isAuthenticated ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
            {hasExistingAccount
              ? <>Sign in with <span className="font-semibold">{invitedEmail}</span> to accept this invitation.</>
              : <>Create an account with <span className="font-semibold">{invitedEmail}</span> to accept this invitation.</>}
          </p>
          <div className="flex flex-wrap gap-3">
            {hasExistingAccount ? (
              <Link
                href={`/signin?email=${encodeURIComponent(invitedEmail)}&next=${encodeURIComponent(nextPath)}`}
                className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
              >
                Continue to sign in
              </Link>
            ) : (
              <Link
                href={`/signup?email=${encodeURIComponent(invitedEmail)}&next=${encodeURIComponent(nextPath)}`}
                className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700"
              >
                Continue to sign up
              </Link>
            )}
          </div>
        </div>
      ) : null}

      {status === "pending" && isAuthenticated && !signedInEmailMatches ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
            You are signed in as <span className="font-semibold">{signedInEmail}</span>. This invitation is for{" "}
            <span className="font-semibold">{invitedEmail}</span>.
          </p>
          <InviteSignOutButton nextPath={nextPath} />
        </div>
      ) : null}

      {status === "pending" && isAuthenticated && signedInEmailMatches ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
            Signed in as <span className="font-semibold">{signedInEmail}</span>. Accepting this invite will add you to the board immediately.
          </p>
          <button
            type="button"
            onClick={() => void handleAccept()}
            disabled={isPending}
            className="rounded-full bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isPending ? "Accepting..." : "Accept invitation"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
