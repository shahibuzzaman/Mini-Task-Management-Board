import type { BoardRole } from "@/types/database";

export function getMemberInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function getRolePillClassName(role: BoardRole) {
  switch (role) {
    case "owner":
      return "bg-violet-100 text-violet-700";
    case "admin":
      return "bg-sky-100 text-sky-700";
    case "member":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function getAccessLabel(role: BoardRole) {
  switch (role) {
    case "owner":
      return "Full System Control";
    case "admin":
      return "Organization Management";
    case "member":
    default:
      return "Standard Access";
  }
}

export function formatInvitationSentAt(value: string) {
  const diffInHours = Math.max(
    1,
    Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60)),
  );

  return diffInHours < 24 ? `Sent ${diffInHours}h ago` : "Sent recently";
}
