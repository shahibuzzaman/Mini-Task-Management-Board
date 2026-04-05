import { NextResponse } from "next/server";
import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import {
  mapTaskRowToTask,
  type TaskRecord,
} from "@/features/tasks/lib/map-task-row-to-task";
import { updateTaskRouteSchema } from "@/features/tasks/lib/task-route-schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TASK_SELECT = `
  id,
  board_id,
  title,
  description,
  status,
  position,
  updated_by,
  created_at,
  updated_at,
  updated_by_profile:profiles!tasks_updated_by_fkey(display_name)
`;

const taskIdSchema = z.uuid("Invalid task identifier.");

type TaskRouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function PATCH(request: Request, context: TaskRouteContext) {
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

    const { taskId } = await context.params;
    const parsedTaskId = taskIdSchema.safeParse(taskId);

    if (!parsedTaskId.success) {
      return NextResponse.json(
        { error: parsedTaskId.error.issues[0]?.message ?? "Invalid task ID." },
        { status: 400 },
      );
    }

    const parsedBody = updateTaskRouteSchema.safeParse(await request.json());
    const url = new URL(request.url);
    const parsedBoardId = boardIdSchema.safeParse(url.searchParams.get("boardId"));

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid task payload." },
        { status: 400 },
      );
    }

    if (!parsedBoardId.success) {
      return NextResponse.json(
        { error: parsedBoardId.error.issues[0]?.message ?? "Invalid board ID." },
        { status: 400 },
      );
    }

    await getCurrentBoardAccess(supabase, user.id, parsedBoardId.data);

    const { data, error } = await supabase
      .from("tasks")
      .update(parsedBody.data)
      .eq("id", parsedTaskId.data)
      .eq("board_id", parsedBoardId.data)
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
          error instanceof Error ? error.message : "Unable to update the task.",
      },
      { status: 500 },
    );
  }
}
