import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import {
  getSupabaseBrowserConfig,
  getSupabaseServiceRoleConfig,
} from "@/lib/supabase/env";

let adminClient: SupabaseClient<Database> | null | undefined;

export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (adminClient !== undefined) {
    return adminClient;
  }

  const browserConfig = getSupabaseBrowserConfig();
  const serviceRoleConfig = getSupabaseServiceRoleConfig();

  if (!browserConfig.isConfigured || !serviceRoleConfig.isConfigured) {
    adminClient = null;
    return adminClient;
  }

  adminClient = createClient<Database>(
    browserConfig.url,
    serviceRoleConfig.serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  return adminClient;
}
