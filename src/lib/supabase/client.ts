import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  const config = getSupabaseBrowserConfig();

  if (!config.isConfigured) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient<Database>(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return browserClient;
}
