import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createBoardInvitationSchema } from "@/features/boards/lib/board-invitation-route-schemas";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import {
  canInviteToBoard,
  canReviewAllInvitations,
} from "@/features/boards/lib/board-permissions";
import { getBoardInvitations } from "@/features/boards/lib/get-board-invitations";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { mapBoardMemberRowToBoardMember } from "@/features/boards/lib/map-board-member-row";
import { mapBoardInvitationRowToBoardInvitation } from "@/features/boards/lib/map-board-invitation-row";
import { sendBoardInvitationEmail } from "@/features/boards/lib/send-board-invitation-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseEmailClient } from "@/lib/supabase/email";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BoardRole } from "@/types/database";

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

type MembershipRow = {
  user_id: string;
};

type InsertedBoardMemberRow = {
  board_id: string;
  user_id: string;
  role: BoardRole;
  created_at: string;
  profile: {
    display_name: string | null;
    email: string;
  } | null;
};

const BOARD_MEMBER_SELECT = `
  board_id,
  user_id,
  role,
  created_at,
  profile:profiles!board_members_user_id_fkey(display_name, email)
`;

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const parsedBoardId = boardIdSchema.safeParse(url.searchParams.get("boardId"));

    if (!parsedBoardId.success) {
      return NextResponse.json(
        { error: parsedBoardId.error.issues[0]?.message ?? "Invalid board ID." },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(supabase, user.id, parsedBoardId.data);

    if (!canInviteToBoard(board)) {
      return NextResponse.json(
        { error: "You do not have access to this board's invitations." },
        { status: 403 },
      );
    }

    const invitations = await getBoardInvitations(
      supabase,
      board.id,
      canReviewAllInvitations(board.currentUserRole)
        ? undefined
        : { invitedByUserId: user.id },
    );

    return NextResponse.json(invitations);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load board invitations.",
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

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const parsed = createBoardInvitationSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid board invitation payload.",
        },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(supabase, user.id, parsed.data.boardId);

    if (!canInviteToBoard(board)) {
      return NextResponse.json(
        { error: "You do not have permission to invite collaborators." },
        { status: 403 },
      );
    }

    const inviteEmail = parsed.data.email.toLowerCase();
    const targetRole =
      board.currentUserRole === "member"
        ? board.defaultInviteRole
        : parsed.data.role;

    const { data: existingMembership } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", inviteEmail)
      .maybeSingle();

    if (existingMembership) {
      const { data: currentBoardMembership } = await adminClient
        .from("board_members")
        .select("user_id")
        .eq("board_id", board.id)
        .eq("user_id", existingMembership.id)
        .maybeSingle<MembershipRow>();

      if (currentBoardMembership) {
        return NextResponse.json(
          { error: "That user is already a member of this board." },
          { status: 409 },
        );
      }

      const { data: insertedMembership, error: membershipInsertError } =
        await adminClient
          .from("board_members")
          .insert({
            board_id: board.id,
            user_id: existingMembership.id,
            role: targetRole,
          })
          .select(BOARD_MEMBER_SELECT)
          .single();

      if (membershipInsertError) {
        return NextResponse.json(
          { error: membershipInsertError.message },
          { status: 400 },
        );
      }

      await adminClient
        .from("board_invitations")
        .update({ revoked_at: new Date().toISOString() })
        .eq("board_id", board.id)
        .eq("email", inviteEmail)
        .is("accepted_at", null)
        .is("revoked_at", null);

      return NextResponse.json(
        {
          type: "member_added",
          member: mapBoardMemberRowToBoardMember(
            insertedMembership as unknown as InsertedBoardMemberRow,
            { id: user.id },
          ),
        },
        { status: 201 },
      );
    }

    const { data: existingInvitation } = await adminClient
      .from("board_invitations")
      .select("id")
      .eq("board_id", board.id)
      .eq("email", inviteEmail)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .maybeSingle();

    if (existingInvitation) {
      return NextResponse.json(
        { error: "There is already a pending invitation for that email." },
        { status: 409 },
      );
    }

    const { data: insertedInvitation, error: insertError } = await adminClient
      .from("board_invitations")
      .insert({
        board_id: board.id,
        email: inviteEmail,
        role: targetRole,
        invited_by: user.id,
        invited_user_id: null,
        token: randomBytes(24).toString("hex"),
        token_expires_at: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7,
        ).toISOString(),
        last_sent_at: new Date().toISOString(),
      })
      .select(BOARD_INVITATION_SELECT)
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    const invitation = mapBoardInvitationRowToBoardInvitation(
      insertedInvitation as never,
    );

    const origin = new URL(request.url).origin;

    try {
      await sendBoardInvitationEmail({
        adminClient,
        emailClient,
        email: invitation.email,
        redirectTo: `${origin}/auth/callback?next=/invite/${invitation.token}`,
      });
    } catch (error) {
      await adminClient.from("board_invitations").delete().eq("id", invitation.id);

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Unable to send the invitation email.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        type: "invitation_sent",
        invitation,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send the invitation.",
      },
      { status: 500 },
    );
  }
}
