import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthRedirectPath } from "@/features/auth/lib/get-auth-redirect-path";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = getAuthRedirectPath(url.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(nextPath, url.origin));
  const supabase = await createSupabaseRouteHandlerClient(response);

  if (!supabase) {
    return NextResponse.redirect(new URL("/auth", url.origin));
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  response.headers.set("Location", new URL(nextPath, url.origin).toString());

  return response;
}
