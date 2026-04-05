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
  description: string;
  archived_at: string | null;
  accent_color: "sky" | "emerald" | "amber" | "rose" | "slate";
  invite_policy: "admins_only" | "members";
  default_invitee_role: "admin" | "member";
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

    if (
      board.currentUserRole !== "owner" &&
      board.currentUserRole !== "admin"
    ) {
      return NextResponse.json(
        { error: "Only board owners and admins can update board settings." },
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

    if (
      parsedBody.data.archivedAt !== undefined &&
      board.currentUserRole !== "owner"
    ) {
      return NextResponse.json(
        { error: "Only board owners can archive or unarchive a board." },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("boards")
      .update({
        name: parsedBody.data.name,
        description: parsedBody.data.description,
        archived_at: parsedBody.data.archivedAt,
        accent_color: parsedBody.data.accentColor,
        invite_policy: parsedBody.data.invitePolicy,
        default_invitee_role: parsedBody.data.defaultInviteRole,
      })
      .eq("id", parsedBoardId.data)
      .select(
        "id, name, description, archived_at, accent_color, invite_policy, default_invitee_role",
      )
      .single<BoardRow>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      id: data.id,
      name: data.name,
      description: data.description,
      archivedAt: data.archived_at,
      accentColor: data.accent_color,
      invitePolicy: data.invite_policy,
      defaultInviteRole: data.default_invitee_role,
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

export async function DELETE(_request: Request, context: RouteContext) {
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
        { error: "Only board owners can delete a board." },
        { status: 403 },
      );
    }

    const { error } = await supabase
      .from("boards")
      .delete()
      .eq("id", parsedBoardId.data);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to delete the board.",
      },
      { status: 500 },
    );
  }
}
