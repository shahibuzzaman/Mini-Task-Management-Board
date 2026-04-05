import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#fafbfe] w-full text-slate-900 font-sans">
      <AppSidebar />
      <div className="flex flex-col flex-1 pl-[260px]">
        <AppHeader />
        <main className="flex-1 w-full bg-[#f8f9fd]">
          {children}
        </main>
      </div>
    </div>
  );
}
