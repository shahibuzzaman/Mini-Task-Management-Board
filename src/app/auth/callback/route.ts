import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthRedirectPath } from "@/features/auth/lib/get-auth-redirect-path";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  let nextPath = getAuthRedirectPath(url.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(nextPath, url.origin));
  const supabase = await createSupabaseRouteHandlerClient(response);

  if (!supabase) {
    return NextResponse.redirect(new URL("/auth", url.origin));
  }

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: acceptedBoardIds } = await supabase.rpc(
        "accept_pending_board_invitations",
      );

      if (
        (!url.searchParams.get("next") || nextPath === "/board") &&
        Array.isArray(acceptedBoardIds) &&
        acceptedBoardIds.length > 0
      ) {
        nextPath = `/board?boardId=${acceptedBoardIds[0]}`;
      }

      response.headers.set("Location", new URL(nextPath, url.origin).toString());
    }
  }

  return response;
}
