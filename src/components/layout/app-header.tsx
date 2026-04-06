"use client";

import { useUIStore } from "@/store/ui-store-provider";

export function AppHeader() {
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);

  return (
    <header className="sticky top-0 z-10 flex min-h-[72px] w-full items-center gap-3 border-b border-[#e2e8f0] bg-white px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
        aria-label="Open navigation menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3 lg:max-w-2xl">
        <div className="relative w-full min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input
            type="text"
            placeholder="Search tasks, projects, or team members..."
            className="w-full rounded-[10px] border border-transparent bg-[#f4f6fc] py-2.5 pl-10 pr-4 text-[14px] font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:border-[#3525cd]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-400/20 text-slate-500 transition-colors hover:bg-slate-400/40 hover:text-slate-700">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
      </div>
    </header>
  );
}
