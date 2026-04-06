"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CreateBoardModal } from "@/components/board/create-board-modal";
import type { AuthViewer } from "@/features/auth/types/viewer";
import { getBoardPath } from "@/features/boards/lib/board-routes";
import { useBoardsQuery } from "@/features/boards/hooks/use-boards-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useUIStore } from "@/store/ui-store-provider";

export function AppSidebar({ viewer }: { viewer: AuthViewer }) {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameParts = pathname.split("/").filter(Boolean);
  const activeBoardId =
    pathnameParts[0] === "boards" && pathnameParts[1] ? pathnameParts[1] : null;
  const boardsQuery = useBoardsQuery([]);
  const boards = boardsQuery.data ?? [];
  const openCreateBoardModal = useUIStore((state) => state.openCreateBoardModal);
  const isMobileSidebarOpen = useUIStore((state) => state.isMobileSidebarOpen);
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    closeMobileSidebar();
    router.replace("/signin");
    router.refresh();
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
    { name: "Boards", icon: ProjectsIcon },
  ];

  useEffect(() => {
    closeMobileSidebar();
  }, [closeMobileSidebar, pathname]);

  function isItemActive(name: string) {
    if (name === "Dashboard") {
      return pathname === "/dashboard";
    }

    return pathnameParts[0] === "boards";
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/30 transition-opacity lg:hidden ${
          isMobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileSidebar}
      />
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-shrink-0 flex-col border-r border-[#e2e8f0] bg-[#fafbfe] transition-transform duration-200 lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="flex items-center justify-between p-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#3525cd] rounded-[8px] flex items-center justify-center text-white shadow-sm">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">TaskMaster Pro</h1>
            <p className="text-[9px] font-bold tracking-[0.15em] text-slate-500 uppercase mt-0.5">The Precise Architect</p>
          </div>
        </div>
        <button
          type="button"
          onClick={closeMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
          aria-label="Close navigation menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="px-5 mb-6 mt-2">
        <button
          type="button"
          onClick={() => {
            openCreateBoardModal();
            closeMobileSidebar();
          }}
          className="w-full bg-[#3525cd] hover:bg-[#4f46e5] transition-colors text-white rounded-xl py-3 text-[14px] font-bold shadow-sm flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Board
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = isItemActive(item.name);

          return (
            <div key={item.name}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={closeMobileSidebar}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${
                    isActive
                      ? "bg-white text-[#3525cd] shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[#f1f5f9]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-[#3525cd]" : "text-slate-400"}`} />
                  {item.name}
                </Link>
              ) : (
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${
                    isActive
                      ? "bg-white text-[#3525cd] shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[#f1f5f9]"
                      : "text-slate-600"
                  }`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-[#3525cd]" : "text-slate-400"}`} />
                  {item.name}
                </div>
              )}

              {item.name === "Boards" ? (
                <div className="mt-2 ml-4 border-l border-slate-200 pl-3">
                  {boards.length > 0 ? (
                    <ul className="space-y-1">
                      {boards.map((board) => {
                        const isBoardActive = board.id === activeBoardId;

                        return (
                          <li key={board.id}>
                            <Link
                              href={getBoardPath(board.id)}
                              onClick={closeMobileSidebar}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                                isBoardActive
                                  ? "bg-white text-slate-950 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${getBoardDotClassName(board.accentColor)}`}
                              />
                              <span className="truncate">{board.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="px-3 py-2 text-[12px] leading-5 text-slate-500">
                      No boards yet.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 mt-auto bg-[#fafbfe]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white overflow-hidden shadow-sm flex-shrink-0">
             <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><path d="M18 17a6 6 0 100-12 6 6 0 000 12zM9 25a9 9 0 0118 0" fill="#94a3b8"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-bold text-slate-900 truncate">{viewer.displayName}</h3>
            <p className="text-[11px] font-semibold text-slate-500 truncate">{viewer.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            aria-label="Log out"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
      <CreateBoardModal />
    </aside>
    </>
  );
}

function getBoardDotClassName(color: "sky" | "emerald" | "amber" | "rose" | "slate") {
  switch (color) {
    case "sky":
      return "bg-sky-500";
    case "emerald":
      return "bg-emerald-500";
    case "amber":
      return "bg-amber-500";
    case "rose":
      return "bg-rose-500";
    case "slate":
    default:
      return "bg-slate-500";
  }
}

// Icons mapping matching exact style parameters
function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  );
}

function ProjectsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  );
}
