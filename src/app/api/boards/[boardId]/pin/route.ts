import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";

type PinResponse = {
  boardId: string;
  isPinned: boolean;
};

function isMissingBoardPinsTableError(message: string) {
  return message.includes("public.board_pins");
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
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

    const { boardId } = await params;
    await getCurrentBoardAccess(supabase, user.id, boardId);

    const { error } = await supabase.from("board_pins").upsert(
      { board_id: boardId, user_id: user.id },
      { onConflict: "board_id,user_id", ignoreDuplicates: true },
    );

    if (error) {
      if (isMissingBoardPinsTableError(error.message)) {
        return NextResponse.json(
          {
            error:
              "Board pinning is not available yet because the database migration has not been applied.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json<PinResponse>({ boardId, isPinned: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to pin the board.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
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

    const { boardId } = await params;
    await getCurrentBoardAccess(supabase, user.id, boardId);

    const { error } = await supabase
      .from("board_pins")
      .delete()
      .eq("board_id", boardId)
      .eq("user_id", user.id);

    if (error) {
      if (isMissingBoardPinsTableError(error.message)) {
        return NextResponse.json(
          {
            error:
              "Board pinning is not available yet because the database migration has not been applied.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json<PinResponse>({ boardId, isPinned: false });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to unpin the board.",
      },
      { status: 500 },
    );
  }
}
