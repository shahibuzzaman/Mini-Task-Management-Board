import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

let emailClient: SupabaseClient<Database> | null | undefined;

export function createSupabaseEmailClient(): SupabaseClient<Database> | null {
  if (emailClient !== undefined) {
    return emailClient;
  }

  const browserConfig = getSupabaseBrowserConfig();

  if (!browserConfig.isConfigured) {
    emailClient = null;
    return emailClient;
  }

  emailClient = createClient<Database>(browserConfig.url, browserConfig.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return emailClient;
}
