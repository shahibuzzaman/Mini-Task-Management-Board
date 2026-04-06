"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { CreateBoardForm } from "@/components/board/create-board-form";
import { useCreateBoardMutation } from "@/features/boards/hooks/use-create-board-mutation";
import { getBoardPath } from "@/features/boards/lib/board-routes";
import type { CreateBoardInput } from "@/features/boards/api/create-board";
import { useToast } from "@/store/use-toast";
import { useUIStore } from "@/store/ui-store-provider";

export function CreateBoardModal() {
  const router = useRouter();
  const isOpen = useUIStore((state) => state.isCreateBoardModalOpen);
  const closeCreateBoardModal = useUIStore((state) => state.closeCreateBoardModal);
  const createBoardMutation = useCreateBoardMutation();
  const showToast = useToast();

  const handleClose = useCallback(() => {
    closeCreateBoardModal();
  }, [closeCreateBoardModal]);

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

  if (typeof document === "undefined" || !isOpen) {
    return null;
  }

  async function handleSubmit(values: CreateBoardInput) {
    try {
      const board = await createBoardMutation.mutateAsync(values);
      handleClose();
      showToast("success", "Board created successfully.");
      router.replace(getBoardPath(board.id));
      router.refresh();
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Unable to create the board.",
      );
      throw error;
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[4px] transition-all" 
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-[580px] bg-[#f0f2f8] rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] flex flex-col pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-board-modal-title"
      >
        <div className="p-8">
          <div className="flex items-start justify-between mb-2">
            <h2 id="create-board-modal-title" className="text-[22px] font-bold tracking-tight text-slate-900">
              Create Board
            </h2>
            <button 
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 p-1 rounded-md transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          <p className="text-[14px] text-slate-500 font-medium mb-8 pr-12 leading-relaxed">
            Design a new architectural space for your team&apos;s workflow and high-priority tasks.
          </p>

          <CreateBoardForm
            isPending={createBoardMutation.isPending}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
