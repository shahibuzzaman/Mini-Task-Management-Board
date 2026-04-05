import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createBoardInvitationSchema,
  updateBoardInvitationSchema,
} from "@/features/boards/lib/board-invitation-route-schemas";
import {
  canInviteToBoard,
  canManageInvitation,
  canReviewAllInvitations,
} from "@/features/boards/lib/board-permissions";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { mapBoardInvitationRowToBoardInvitation } from "@/features/boards/lib/map-board-invitation-row";
import { sendBoardInvitationEmail } from "@/features/boards/lib/send-board-invitation-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseEmailClient } from "@/lib/supabase/email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const invitationIdSchema = z.uuid("Invalid invitation identifier.");

const BOARD_INVITATION_SELECT = `
  id,
  board_id,
  email,
  role,
  invited_by,
  invited_user_id,
  token,
  token_expires_at,
  last_sent_at,
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
  role: "admin" | "member" | "owner";
  invited_by: string;
  accepted_at: string | null;
  revoked_at: string | null;
};

type DeletableInvitationRow = {
  id: string;
  board_id: string;
  invited_by: string;
  accepted_at: string | null;
  revoked_at: string | null;
  inviter: {
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

    const adminClient = createSupabaseAdminClient();
    const emailClient = createSupabaseEmailClient();

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

    if (!canInviteToBoard(board)) {
      return NextResponse.json(
        { error: "You do not have permission to manage invitations." },
        { status: 403 },
      );
    }

    const { data: invitation, error: invitationError } = await supabase
      .from("board_invitations")
      .select("board_id, email, role, invited_by, accepted_at, revoked_at")
      .eq("id", parsedInvitationId.data)
      .single<InvitationRow>();

    if (invitationError) {
      return NextResponse.json({ error: invitationError.message }, { status: 404 });
    }

    if (invitation.board_id !== board.id) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (
      !canReviewAllInvitations(board.currentUserRole) &&
      invitation.invited_by !== user.id
    ) {
      return NextResponse.json(
        { error: "You can only manage invitations you created." },
        { status: 403 },
      );
    }

    const updatePayload: {
      role?: "admin" | "member";
      token?: string;
      token_expires_at?: string;
      last_sent_at?: string;
    } = {};

    if (parsedBody.data.action === "resend") {
      if (invitation.accepted_at || invitation.revoked_at) {
        return NextResponse.json(
          { error: "Only pending invitations can be resent." },
          { status: 400 },
        );
      }

      const nextToken = randomBytes(24).toString("hex");
      const nextExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
      const nextSentAt = new Date().toISOString();

      updatePayload.token = nextToken;
      updatePayload.token_expires_at = nextExpiry;
      updatePayload.last_sent_at = nextSentAt;
    }

    if (parsedBody.data.role) {
      if (!canReviewAllInvitations(board.currentUserRole)) {
        return NextResponse.json(
          { error: "Only board owners and admins can change invitation roles." },
          { status: 403 },
        );
      }

      updatePayload.role = parsedBody.data.role;
    }

    if (Object.keys(updatePayload).length === 0) {
      const { data, error } = await supabase
        .from("board_invitations")
        .select(BOARD_INVITATION_SELECT)
        .eq("id", parsedInvitationId.data)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(mapBoardInvitationRowToBoardInvitation(data as never));
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

    const mappedInvitation = mapBoardInvitationRowToBoardInvitation(data as never);

    if (parsedBody.data.action === "resend") {
      try {
        await sendBoardInvitationEmail({
          adminClient,
          emailClient,
          email: invitation.email,
          redirectTo: `${new URL(request.url).origin}/auth/callback?next=/invite/${mappedInvitation.token}`,
        });
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Unable to resend the invitation email.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(mappedInvitation);
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

    if (!canInviteToBoard(board)) {
      return NextResponse.json(
        { error: "You do not have permission to revoke invitations." },
        { status: 403 },
      );
    }

    const { data: invitation, error: invitationError } = await supabase
      .from("board_invitations")
      .select(
        "id, board_id, invited_by, email, accepted_at, revoked_at, inviter:profiles!board_invitations_invited_by_fkey(email)",
      )
      .eq("id", parsedInvitationId.data)
      .single<DeletableInvitationRow>();

    if (invitationError) {
      return NextResponse.json({ error: invitationError.message }, { status: 404 });
    }

    if (invitation.board_id !== board.id) {
      return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
    }

    if (
      !canManageInvitation(
        board,
        {
          invitedByEmail: invitation.inviter?.email ?? "",
          acceptedAt: invitation.accepted_at,
          revokedAt: invitation.revoked_at,
        },
        user.email ?? "",
      ) &&
      invitation.invited_by !== user.id
    ) {
      return NextResponse.json(
        { error: "You can only revoke invitations you created." },
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
