import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DashboardMetrics = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
};

export async function getDashboardMetrics(
  supabase: SupabaseClient<Database>,
  boardIds: string[],
): Promise<DashboardMetrics> {
  if (boardIds.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0,
    };
  }

  const now = new Date().toISOString();

  const [totalResult, completedResult, inProgressResult, overdueResult] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .in("board_id", boardIds),
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .in("board_id", boardIds)
        .eq("status", "done"),
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .in("board_id", boardIds)
        .eq("status", "in_progress"),
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .in("board_id", boardIds)
        .neq("status", "done")
        .not("due_at", "is", null)
        .lt("due_at", now),
    ]);

  const errors = [
    totalResult.error,
    completedResult.error,
    inProgressResult.error,
    overdueResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]?.message ?? "Failed to load dashboard metrics.");
  }

  return {
    totalTasks: totalResult.count ?? 0,
    completedTasks: completedResult.count ?? 0,
    inProgressTasks: inProgressResult.count ?? 0,
    overdueTasks: overdueResult.count ?? 0,
  };
}
