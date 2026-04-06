"use client";

import Link from "next/link";
import { getBoardPath, getBoardSectionPath } from "@/features/boards/lib/board-routes";

type BoardTabsProps = {
  boardId: string;
  activeTab: "tasks" | "members" | "settings";
};

const TAB_ITEMS = [
  { key: "tasks", label: "Tasks", href: (boardId: string) => getBoardPath(boardId) },
  {
    key: "members",
    label: "Members",
    href: (boardId: string) => getBoardSectionPath(boardId, "members"),
  },
  {
    key: "settings",
    label: "Settings",
    href: (boardId: string) => getBoardSectionPath(boardId, "settings"),
  },
] as const;

export function BoardTabs({ boardId, activeTab }: BoardTabsProps) {
  return (
    <nav className="overflow-x-auto border-b border-slate-200">
      <ul className="flex min-w-max gap-5 sm:gap-8">
        {TAB_ITEMS.map((item) => {
          const isActive = item.key === activeTab;

          return (
            <li key={item.key}>
              <Link
                href={item.href(boardId)}
                className={`inline-flex whitespace-nowrap border-b-[3px] px-2 py-4 text-[15px] font-bold transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
