import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function ensureCurrentUserSharedBoard(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase.rpc("ensure_current_user_shared_board");

  if (error || !data) {
    throw new Error(
      error?.message ?? "Unable to prepare the authenticated shared board.",
    );
  }

  return data;
}
