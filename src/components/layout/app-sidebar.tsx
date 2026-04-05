"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: DashboardIcon },
    { name: "My Tasks", href: "/my-tasks", icon: TasksIcon },
    { name: "Notifications", href: "/notifications", icon: NotificationsIcon },
    { name: "Boards", href: "/dashboard", icon: ProjectsIcon },
    { name: "Archives", href: "/archives", icon: ArchivesIcon },
  ];

  return (
    <aside className="w-[260px] h-screen bg-[#fafbfe] border-r border-[#e2e8f0] flex flex-col flex-shrink-0 fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#3525cd] rounded-[8px] flex items-center justify-center text-white shadow-sm">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">TaskMaster Pro</h1>
            <p className="text-[9px] font-bold tracking-[0.15em] text-slate-500 uppercase mt-0.5">The Precise Architect</p>
          </div>
        </div>
      </div>

      <div className="px-5 mb-6 mt-2">
        <button className="w-full bg-[#3525cd] hover:bg-[#4f46e5] transition-colors text-white rounded-xl py-3 text-[14px] font-bold shadow-sm flex items-center justify-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Board
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.name === "Dashboard" && pathname === "/board");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-colors ${
                isActive
                  ? "bg-white text-[#3525cd] shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-[#f1f5f9]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-[#3525cd]" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 mt-auto bg-[#fafbfe]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white overflow-hidden shadow-sm flex-shrink-0">
             <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><path d="M18 17a6 6 0 100-12 6 6 0 000 12zM9 25a9 9 0 0118 0" fill="#94a3b8"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-bold text-slate-900 truncate">Architech Studio</h3>
            <p className="text-[11px] font-semibold text-slate-500 truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Icons mapping matching exact style parameters
function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  );
}

function TasksIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}

function NotificationsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
  );
}

function ProjectsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
  );
}

function ArchivesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="4" width="20" height="5" rx="2" ry="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>
  );
}
