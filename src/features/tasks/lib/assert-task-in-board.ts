import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function assertTaskInBoard(
  supabase: SupabaseClient<Database>,
  taskId: string,
  boardId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", taskId)
    .eq("board_id", boardId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Task not found for the current board.");
  }
}
