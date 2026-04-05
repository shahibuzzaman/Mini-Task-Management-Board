import type { TaskPriority } from "@/types/database";

export const TASK_PRIORITIES: Array<{ value: TaskPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function getTaskPriorityTone(priority: TaskPriority): string {
  switch (priority) {
    case "low":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "medium":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "high":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "urgent":
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}
