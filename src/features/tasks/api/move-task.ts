import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapTaskRowToTask } from "@/features/tasks/lib/map-task-row-to-task";
import type { Task } from "@/features/tasks/types/task";

export type MoveTaskInput = {
  id: string;
  status: Task["status"];
  position: number;
  updatedBy: string;
};

export async function moveTask(input: MoveTaskInput): Promise<Task> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: input.status,
      position: input.position,
      updated_by: input.updatedBy,
    })
    .eq("id", input.id)
    .select(
      "id, title, description, status, position, updated_by, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapTaskRowToTask(data);
}
