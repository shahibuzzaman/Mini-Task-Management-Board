import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createBoardInvitationSchema,
  updateBoardInvitationSchema,
} from "@/features/boards/lib/board-invitation-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { mapBoardInvitationRowToBoardInvitation } from "@/features/boards/lib/map-board-invitation-row";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const invitationIdSchema = z.uuid("Invalid invitation identifier.");

const BOARD_INVITATION_SELECT = `
  id,
  board_id,
  email,
  role,
  invited_by,
  invited_user_id,
  created_at,
  accepted_at,
  revoked_at,
  inviter:profiles!board_invitations_invited_by_fkey(display_name, email)
`;

type RouteContext = {
  params: Promise<{
    invitationId: string;
  }>;
};

type InvitationRow = {
  board_id: string;
  email: string;
  accepted_at: string | null;
  revoked_at: string | null;
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

    const adminClient = createSupabaseAdminClient();

    if (!adminClient) {
      return NextResponse.json(
        { error: "Supabase admin client is not configured." },
        { status: 503 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { invitationId } = await context.params;
    const parsedInvitationId = invitationIdSchema.safeParse(invitationId);

    if (!parsedInvitationId.success) {
      return NextResponse.json(
        {
          error:
            parsedInvitationId.error.issues[0]?.message ??
            "Invalid invitation ID.",
        },
        { status: 400 },
      );
    }

    const parsedBody = updateBoardInvitationSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error:
            parsedBody.error.issues[0]?.message ??
            "Invalid board invitation payload.",
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
        { error: "Only board owners and admins can update invitations." },
        { status: 403 },
      );
    }

    const { data: invitation, error: invitationError } = await supabase
      .from("board_invitations")
      .select("board_id, email, accepted_at, revoked_at")
      .eq("id", parsedInvitationId.data)
      .single<InvitationRow>();

    if (invitationError) {
      return NextResponse.json({ error: invitationError.message }, { status: 404 });
    }

    if (invitation.board_id !== board.id) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (parsedBody.data.action === "resend") {
      if (invitation.accepted_at || invitation.revoked_at) {
        return NextResponse.json(
          { error: "Only pending invitations can be resent." },
          { status: 400 },
        );
      }

      const origin = new URL(request.url).origin;
      const { error: resendError } = await adminClient.auth.admin.inviteUserByEmail(
        invitation.email,
        {
          redirectTo: `${origin}/auth/callback?next=/board?boardId=${board.id}`,
          data: {
            invited_board_id: board.id,
          },
        },
      );

      if (resendError) {
        return NextResponse.json({ error: resendError.message }, { status: 400 });
      }
    }

    const updatePayload: {
      role?: "admin" | "member";
    } = {};

    if (parsedBody.data.role) {
      updatePayload.role = parsedBody.data.role;
    }

    const { data, error } = await supabase
      .from("board_invitations")
      .update(updatePayload)
      .eq("id", parsedInvitationId.data)
      .select(BOARD_INVITATION_SELECT)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(mapBoardInvitationRowToBoardInvitation(data as never));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the invitation.",
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

    const { invitationId } = await context.params;
    const parsedInvitationId = invitationIdSchema.safeParse(invitationId);
    const boardId = new URL(request.url).searchParams.get("boardId");
    const parsedBody = createBoardInvitationSchema.pick({ boardId: true }).safeParse({
      boardId,
    });

    if (!parsedInvitationId.success) {
      return NextResponse.json(
        {
          error:
            parsedInvitationId.error.issues[0]?.message ??
            "Invalid invitation ID.",
        },
        { status: 400 },
      );
    }

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid board ID." },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(supabase, user.id, parsedBody.data.boardId);

    if (
      board.currentUserRole !== "owner" &&
      board.currentUserRole !== "admin"
    ) {
      return NextResponse.json(
        { error: "Only board owners and admins can revoke invitations." },
        { status: 403 },
      );
    }

    const { error } = await supabase
      .from("board_invitations")
      .update({
        revoked_at: new Date().toISOString(),
      })
      .eq("id", parsedInvitationId.data)
      .eq("board_id", board.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to revoke the invitation.",
      },
      { status: 500 },
    );
  }
}
