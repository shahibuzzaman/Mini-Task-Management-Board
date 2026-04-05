import { NextResponse } from "next/server";
import { z } from "zod";
import { getAccessibleBoards } from "@/features/boards/lib/get-accessible-boards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const invitationTokenSchema = z
  .string()
  .trim()
  .min(20, "Invalid invitation token.");

type RouteContext = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "Sign in with the invited email address first." },
        { status: 401 },
      );
    }

    const { token } = await context.params;
    const parsedToken = invitationTokenSchema.safeParse(token);

    if (!parsedToken.success) {
      return NextResponse.json(
        { error: parsedToken.error.issues[0]?.message ?? "Invalid invitation token." },
        { status: 400 },
      );
    }

    const { data: boardId, error } = await supabase.rpc("accept_board_invitation", {
      target_token: parsedToken.data,
    });

    if (error || !boardId) {
      return NextResponse.json(
        { error: error?.message ?? "Unable to accept the invitation." },
        { status: 400 },
      );
    }

    const boards = await getAccessibleBoards(supabase, user.id);
    const board = boards.find((candidate) => candidate.id === boardId);

    if (!board) {
      return NextResponse.json(
        { error: "The invited board could not be loaded." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      boardId,
      boardName: board.name,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to accept the invitation.",
      },
      { status: 500 },
    );
  }
}
