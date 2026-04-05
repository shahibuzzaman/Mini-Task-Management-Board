import { NextResponse } from "next/server";
import { createBoardInvitationSchema } from "@/features/boards/lib/board-invitation-route-schemas";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getBoardInvitations } from "@/features/boards/lib/get-board-invitations";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { mapBoardInvitationRowToBoardInvitation } from "@/features/boards/lib/map-board-invitation-row";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

type MembershipRow = {
  user_id: string;
};

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

    if (
      board.currentUserRole !== "owner" &&
      board.currentUserRole !== "admin"
    ) {
      return NextResponse.json(
        { error: "Only board owners and admins can view invitations." },
        { status: 403 },
      );
    }

    const invitations = await getBoardInvitations(supabase, board.id);

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

    if (
      board.currentUserRole !== "owner" &&
      board.currentUserRole !== "admin"
    ) {
      return NextResponse.json(
        { error: "Only board owners and admins can send invitations." },
        { status: 403 },
      );
    }

    const { data: existingMembership } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", parsed.data.email.toLowerCase())
      .maybeSingle();

    if (existingMembership) {
      const { data: currentBoardMembership } = await supabase
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
    }

    const { data: existingInvitation } = await supabase
      .from("board_invitations")
      .select("id")
      .eq("board_id", board.id)
      .eq("email", parsed.data.email.toLowerCase())
      .is("accepted_at", null)
      .is("revoked_at", null)
      .maybeSingle();

    if (existingInvitation) {
      return NextResponse.json(
        { error: "There is already a pending invitation for that email." },
        { status: 409 },
      );
    }

    const origin = new URL(request.url).origin;
    const { data: invitedUserData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(parsed.data.email, {
        redirectTo: `${origin}/auth/callback?next=/board?boardId=${board.id}`,
        data: {
          invited_board_id: board.id,
        },
      });

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }

    const { data: insertedInvitation, error: insertError } = await supabase
      .from("board_invitations")
      .insert({
        board_id: board.id,
        email: parsed.data.email.toLowerCase(),
        role: parsed.data.role,
        invited_by: user.id,
        invited_user_id: invitedUserData.user?.id ?? null,
      })
      .select(BOARD_INVITATION_SELECT)
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json(
      mapBoardInvitationRowToBoardInvitation(insertedInvitation as never),
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
