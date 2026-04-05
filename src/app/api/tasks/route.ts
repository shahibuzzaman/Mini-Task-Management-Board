import { NextResponse } from "next/server";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import {
  mapTaskRowToTask,
  type TaskRecord,
} from "@/features/tasks/lib/map-task-row-to-task";
import { createTaskRouteSchema } from "@/features/tasks/lib/task-route-schemas";
import { validateTaskAssignee } from "@/features/tasks/lib/validate-task-assignee";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TASK_SELECT = `
  id,
  board_id,
  title,
  description,
  status,
  priority,
  due_at,
  labels,
  assignee_id,
  position,
  updated_by,
  created_at,
  updated_at,
  updated_by_profile:profiles!tasks_updated_by_fkey(display_name),
  assignee_profile:profiles!tasks_assignee_id_fkey(display_name)
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

    await getCurrentBoardAccess(supabase, user.id, parsedBoardId.data);
    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_SELECT)
      .eq("board_id", parsedBoardId.data)
      .order("position", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      (data as unknown as TaskRecord[]).map(mapTaskRowToTask),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load tasks.",
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

    const parsed = createTaskRouteSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid task payload." },
        { status: 400 },
      );
    }

    await getCurrentBoardAccess(supabase, user.id, parsed.data.boardId);
    await validateTaskAssignee(
      supabase,
      parsed.data.boardId,
      parsed.data.assigneeId,
    );
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        board_id: parsed.data.boardId,
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        priority: parsed.data.priority,
        due_at: parsed.data.dueAt,
        labels: parsed.data.labels,
        assignee_id: parsed.data.assigneeId,
        position: parsed.data.position,
      })
      .select(TASK_SELECT)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(mapTaskRowToTask(data as unknown as TaskRecord));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create the task.",
      },
      { status: 500 },
    );
  }
}
