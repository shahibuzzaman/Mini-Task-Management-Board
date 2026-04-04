import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapTaskRowToTask } from "@/features/tasks/lib/map-task-row-to-task";
import type { Task } from "@/features/tasks/types/task";

export async function getTasks(): Promise<Task[]> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, title, description, status, position, updated_by, created_at, updated_at",
    )
    .order("position", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapTaskRowToTask);
}
