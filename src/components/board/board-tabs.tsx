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
    <nav className="border-b border-slate-200">
      <ul className="flex flex-wrap gap-8">
        {TAB_ITEMS.map((item) => {
          const isActive = item.key === activeTab;

          return (
            <li key={item.key}>
              <Link
                href={item.href(boardId)}
                className={`inline-flex border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-[#4f46e5] text-[#4f46e5]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
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
