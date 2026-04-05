import { NextResponse } from "next/server";
import { addBoardMemberSchema } from "@/features/boards/lib/board-member-route-schemas";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { getBoardMembers } from "@/features/boards/lib/get-board-members";
import { mapBoardMemberRowToBoardMember } from "@/features/boards/lib/map-board-member-row";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileLookupRow = {
  id: string;
  display_name: string | null;
  email: string;
};

type InsertedBoardMemberRow = {
  board_id: string;
  user_id: string;
  role: "owner" | "member";
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
    const members = await getBoardMembers(supabase, board.id, { id: user.id });

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load board members.",
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

    const parsed = addBoardMemberSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid board member payload.",
        },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(supabase, user.id, parsed.data.boardId);

    if (board.currentUserRole !== "owner") {
      return NextResponse.json(
        { error: "Only board owners can add members." },
        { status: 403 },
      );
    }

    const { data: matchingProfiles, error: matchingProfilesError } =
      await supabase.rpc("lookup_board_member_candidate", {
        target_board_id: board.id,
        target_email: parsed.data.email,
      });

    if (matchingProfilesError) {
      return NextResponse.json(
        { error: matchingProfilesError.message },
        { status: 400 },
      );
    }

    const matchingProfile = matchingProfiles[0] as ProfileLookupRow | undefined;

    if (!matchingProfile) {
      return NextResponse.json(
        {
          error:
            "No registered user was found for that email. Ask them to sign up first.",
        },
        { status: 404 },
      );
    }

    const { data: existingMembership, error: existingMembershipError } =
      await supabase
        .from("board_members")
        .select("user_id")
        .eq("board_id", board.id)
        .eq("user_id", matchingProfile.id)
        .maybeSingle();

    if (existingMembershipError) {
      return NextResponse.json(
        { error: existingMembershipError.message },
        { status: 400 },
      );
    }

    if (existingMembership) {
      return NextResponse.json(
        { error: "That user is already a member of the board." },
        { status: 409 },
      );
    }

    const { data: insertedMembership, error: insertError } = await supabase
      .from("board_members")
      .insert({
        board_id: board.id,
        user_id: matchingProfile.id,
        role: "member",
      })
      .select(BOARD_MEMBER_SELECT)
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json(
      mapBoardMemberRowToBoardMember(
        insertedMembership as unknown as InsertedBoardMemberRow,
        { id: user.id },
      ),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to add the member.",
      },
      { status: 500 },
    );
  }
}
