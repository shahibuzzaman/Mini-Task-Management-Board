import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

type SupabaseCookie = {
  name: string;
  value: string;
  options?: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2];
};

function createConfiguredServerClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  applyCookies?: (cookiesToSet: SupabaseCookie[]) => void,
): SupabaseClient<Database> | null {
  const config = getSupabaseBrowserConfig();

  if (!config.isConfigured) {
    return null;
  }

  return createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components may not be able to mutate cookies directly.
        }

        applyCookies?.(cookiesToSet);
      },
    },
  });
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createConfiguredServerClient(cookieStore);
}

export async function createSupabaseRouteHandlerClient(response: NextResponse) {
  const cookieStore = await cookies();

  return createConfiguredServerClient(cookieStore, (cookiesToSet) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
  });
}
