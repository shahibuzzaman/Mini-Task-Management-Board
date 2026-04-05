import { NextResponse } from "next/server";
import { createBoardSchema } from "@/features/boards/lib/board-route-schemas";
import { ensureCurrentUserProfile } from "@/features/boards/lib/ensure-current-user-profile";
import { getAccessibleBoards } from "@/features/boards/lib/get-accessible-boards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
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

    const boards = await getAccessibleBoards(supabase, user.id);

    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load boards.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

    const parsed = createBoardSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid board payload.",
        },
        { status: 400 },
      );
    }

    await ensureCurrentUserProfile(supabase);

    const { data: boardId, error } = await supabase.rpc("create_board_with_owner", {
      target_name: parsed.data.name,
      target_description: parsed.data.description,
    });

    if (error || !boardId) {
      return NextResponse.json(
        { error: error?.message ?? "Unable to create the board." },
        { status: 400 },
      );
    }

    const boards = await getAccessibleBoards(supabase, user.id);
    const board = boards.find((candidate) => candidate.id === boardId);

    if (!board) {
      return NextResponse.json(
        { error: "Created board could not be loaded." },
        { status: 500 },
      );
    }

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create the board.",
      },
      { status: 500 },
    );
  }
}
