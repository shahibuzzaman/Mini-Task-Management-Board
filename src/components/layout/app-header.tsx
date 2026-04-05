"use client";

export function AppHeader() {
  return (
    <header className="h-[72px] bg-white border-b border-[#e2e8f0] flex items-center px-8 shrink-0 relative z-10 w-full sticky top-0">
      <div className="flex-1 flex items-center gap-4 max-w-2xl">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input
            type="text"
            placeholder="Search tasks, projects, or team members..."
            className="w-full bg-[#f4f6fc] text-slate-800 placeholder:text-slate-400 text-[14px] font-medium rounded-[10px] pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3525cd]/20 focus:bg-white transition-all border border-transparent focus:border-[#3525cd]/30"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <button className="w-8 h-8 rounded-full bg-slate-400/20 hover:bg-slate-400/40 text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center flex-shrink-0">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </button>
      </div>
    </header>
  );
}
