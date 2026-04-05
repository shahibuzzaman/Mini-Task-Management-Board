import { NextResponse } from "next/server";
import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { getAccessibleBoards } from "@/features/boards/lib/get-accessible-boards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const transferOwnershipSchema = z.object({
  targetUserId: z.uuid("Select a valid member."),
});

type RouteContext = {
  params: Promise<{
    boardId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
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
    const parsedBody = transferOwnershipSchema.safeParse(await request.json());

    if (!parsedBoardId.success) {
      return NextResponse.json(
        { error: parsedBoardId.error.issues[0]?.message ?? "Invalid board ID." },
        { status: 400 },
      );
    }

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error:
            parsedBody.error.issues[0]?.message ??
            "Invalid ownership transfer payload.",
        },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(supabase, user.id, parsedBoardId.data);

    if (board.currentUserRole !== "owner") {
      return NextResponse.json(
        { error: "Only board owners can transfer ownership." },
        { status: 403 },
      );
    }

    const { error } = await supabase.rpc("transfer_board_ownership", {
      target_board_id: parsedBoardId.data,
      target_user_id: parsedBody.data.targetUserId,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const boards = await getAccessibleBoards(supabase, user.id);
    const updatedBoard = boards.find((candidate) => candidate.id === parsedBoardId.data);

    if (!updatedBoard) {
      return NextResponse.json(
        { error: "Board could not be loaded after transfer." },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedBoard);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to transfer board ownership.",
      },
      { status: 500 },
    );
  }
}
