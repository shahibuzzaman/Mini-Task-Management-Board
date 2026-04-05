import { NextResponse } from "next/server";
import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { assertTaskInBoard } from "@/features/tasks/lib/assert-task-in-board";
import {
  mapTaskCommentRowToTaskComment,
  type TaskCommentRecord,
} from "@/features/tasks/lib/map-task-comment-row";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const taskIdSchema = z.uuid("Invalid task identifier.");
const createCommentSchema = z.object({
  boardId: boardIdSchema,
  body: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty.")
    .max(2000, "Comment must be 2000 characters or fewer."),
});

const TASK_COMMENT_SELECT = `
  id,
  task_id,
  body,
  created_by,
  created_at,
  author_profile:profiles!task_comments_created_by_fkey(display_name)
`;

type RouteContext = {
  params: Promise<{
    taskId: string;
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

    const { taskId } = await context.params;
    const parsedTaskId = taskIdSchema.safeParse(taskId);
    const parsedBody = createCommentSchema.safeParse(await request.json());

    if (!parsedTaskId.success) {
      return NextResponse.json(
        { error: parsedTaskId.error.issues[0]?.message ?? "Invalid task ID." },
        { status: 400 },
      );
    }

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Invalid comment payload." },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(
      supabase,
      user.id,
      parsedBody.data.boardId,
    );
    await assertTaskInBoard(supabase, parsedTaskId.data, parsedBody.data.boardId);

    if (board.archivedAt) {
      return NextResponse.json(
        { error: "Archived boards are read-only." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("task_comments")
      .insert({
        task_id: parsedTaskId.data,
        body: parsedBody.data.body,
        created_by: user.id,
      })
      .select(TASK_COMMENT_SELECT)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      mapTaskCommentRowToTaskComment(data as unknown as TaskCommentRecord),
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to add the comment.",
      },
      { status: 500 },
    );
  }
}
