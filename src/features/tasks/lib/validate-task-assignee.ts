import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function validateTaskAssignee(
  supabase: SupabaseClient<Database>,
  boardId: string,
  assigneeId: string | null,
): Promise<void> {
  if (!assigneeId) {
    return;
  }

  const { data, error } = await supabase
    .from("board_members")
    .select("user_id")
    .eq("board_id", boardId)
    .eq("user_id", assigneeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Assignee must be a member of the current board.");
  }
}
