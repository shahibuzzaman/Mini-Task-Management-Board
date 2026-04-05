import { NextResponse } from "next/server";
import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { mapBoardMemberRowToBoardMember } from "@/features/boards/lib/map-board-member-row";
import { updateBoardMemberSchema } from "@/features/boards/lib/board-member-route-schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const userIdSchema = z.uuid("Invalid user identifier.");

const BOARD_MEMBER_SELECT = `
  board_id,
  user_id,
  role,
  created_at,
  profile:profiles!board_members_user_id_fkey(display_name, email)
`;

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type BoardMemberRow = {
  board_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  profile: {
    display_name: string | null;
    email: string;
  } | null;
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

    const { userId } = await context.params;
    const parsedUserId = userIdSchema.safeParse(userId);
    const parsedBody = updateBoardMemberSchema.safeParse(await request.json());

    if (!parsedUserId.success) {
      return NextResponse.json(
        { error: parsedUserId.error.issues[0]?.message ?? "Invalid user ID." },
        { status: 400 },
      );
    }

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error:
            parsedBody.error.issues[0]?.message ??
            "Invalid board member payload.",
        },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(supabase, user.id, parsedBody.data.boardId);

    if (
      board.currentUserRole !== "owner" &&
      board.currentUserRole !== "admin"
    ) {
      return NextResponse.json(
        { error: "Only board owners and admins can update member roles." },
        { status: 403 },
      );
    }

    const { data: currentMembership, error: currentMembershipError } =
      await supabase
        .from("board_members")
        .select("user_id, role")
        .eq("board_id", board.id)
        .eq("user_id", parsedUserId.data)
        .single();

    if (currentMembershipError) {
      return NextResponse.json(
        { error: currentMembershipError.message },
        { status: 404 },
      );
    }

    if (
      board.currentUserRole === "admin" &&
      currentMembership.role === "owner"
    ) {
      return NextResponse.json(
        { error: "Admins cannot change the board owner role." },
        { status: 403 },
      );
    }

    if (currentMembership.role === "owner") {
      const { count, error: ownersCountError } = await supabase
        .from("board_members")
        .select("*", { count: "exact", head: true })
        .eq("board_id", board.id)
        .eq("role", "owner");

      if (ownersCountError) {
        return NextResponse.json(
          { error: ownersCountError.message },
          { status: 400 },
        );
      }

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "The board must keep at least one owner." },
          { status: 400 },
        );
      }
    }

    const { data: updatedMembership, error: updateError } = await supabase
      .from("board_members")
      .update({
        role: parsedBody.data.role,
      })
      .eq("board_id", board.id)
      .eq("user_id", parsedUserId.data)
      .select(BOARD_MEMBER_SELECT)
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json(
      mapBoardMemberRowToBoardMember(
        updatedMembership as unknown as BoardMemberRow,
        { id: user.id },
      ),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the board member.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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

    const { userId } = await context.params;
    const parsedUserId = userIdSchema.safeParse(userId);
    const url = new URL(request.url);
    const parsedBoardId = boardIdSchema.safeParse(url.searchParams.get("boardId"));

    if (!parsedUserId.success) {
      return NextResponse.json(
        { error: parsedUserId.error.issues[0]?.message ?? "Invalid user ID." },
        { status: 400 },
      );
    }

    if (!parsedBoardId.success) {
      return NextResponse.json(
        { error: parsedBoardId.error.issues[0]?.message ?? "Invalid board ID." },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(supabase, user.id, parsedBoardId.data);

    if (
      board.currentUserRole !== "owner" &&
      board.currentUserRole !== "admin"
    ) {
      return NextResponse.json(
        { error: "Only board owners and admins can remove members." },
        { status: 403 },
      );
    }

    const { data: currentMembership, error: currentMembershipError } =
      await supabase
        .from("board_members")
        .select("role")
        .eq("board_id", board.id)
        .eq("user_id", parsedUserId.data)
        .single();

    if (currentMembershipError) {
      return NextResponse.json(
        { error: currentMembershipError.message },
        { status: 404 },
      );
    }

    if (currentMembership.role === "owner") {
      if (board.currentUserRole === "admin") {
        return NextResponse.json(
          { error: "Admins cannot remove the board owner." },
          { status: 403 },
        );
      }

      const { count, error: ownersCountError } = await supabase
        .from("board_members")
        .select("*", { count: "exact", head: true })
        .eq("board_id", board.id)
        .eq("role", "owner");

      if (ownersCountError) {
        return NextResponse.json(
          { error: ownersCountError.message },
          { status: 400 },
        );
      }

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "The board must keep at least one owner." },
          { status: 400 },
        );
      }
    }

    const { error: deleteError } = await supabase
      .from("board_members")
      .delete()
      .eq("board_id", board.id)
      .eq("user_id", parsedUserId.data);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to remove the board member.",
      },
      { status: 500 },
    );
  }
}
