"use client";

import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

type BoardInvitationSentModalProps = {
  email: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export function BoardInvitationSentModal({
  email,
  isOpen,
  onClose,
}: BoardInvitationSentModalProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "unset";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleClose, isOpen]);

  if (typeof document === "undefined" || !isOpen || !email) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[4px] transition-all"
        onClick={handleClose}
      />

      <div
        className="relative flex w-full max-w-[460px] flex-col rounded-xl bg-[#f0f2f8] p-8 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-invitation-sent-title"
      >
        <div className="mb-2 flex items-start justify-between">
          <h2
            id="board-invitation-sent-title"
            className="text-[22px] font-bold tracking-tight text-slate-900"
          >
            Invitation Sent
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-slate-700"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <p className="pr-8 text-[14px] leading-relaxed text-slate-600">
          No account was found for <span className="font-semibold">{email}</span>.
          An invitation email has been sent. Ask them to check their inbox and use
          the link in the email to join the board.
        </p>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl bg-primary px-5 py-2.5 text-[14px] font-bold text-white shadow-sm transition hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
