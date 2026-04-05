import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapTaskRowToTask } from "@/features/tasks/lib/map-task-row-to-task";
import type { UpdateTaskInput } from "@/features/tasks/types/task-form";
import type { Task } from "@/features/tasks/types/task";

export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: input.title,
      description: input.description,
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
