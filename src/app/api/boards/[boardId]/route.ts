import { NextResponse } from "next/server";
import { z } from "zod";
import {
  boardIdSchema,
  updateBoardSchema,
} from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    boardId: string;
  }>;
};

type BoardRow = {
  id: string;
  name: string;
};

export async function PATCH(request: Request, context: RouteContext) {
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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { boardId } = await context.params;
    const parsedBoardId = boardIdSchema.safeParse(boardId);

    if (!parsedBoardId.success) {
      return NextResponse.json(
        { error: parsedBoardId.error.issues[0]?.message ?? "Invalid board ID." },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(supabase, user.id, parsedBoardId.data);

    if (board.currentUserRole !== "owner") {
      return NextResponse.json(
        { error: "Only board owners can update board settings." },
        { status: 403 },
      );
    }

    const parsedBody = updateBoardSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid board payload." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("boards")
      .update({
        name: parsedBody.data.name,
      })
      .eq("id", parsedBoardId.data)
      .select("id, name")
      .single<BoardRow>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      currentUserRole: board.currentUserRole,
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Invalid request."
        : error instanceof Error
          ? error.message
          : "Unable to update the board.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
