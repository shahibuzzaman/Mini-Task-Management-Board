import { NextResponse } from "next/server";
import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { assertTaskInBoard } from "@/features/tasks/lib/assert-task-in-board";
import {
  mapTaskAttachmentRowToTaskAttachment,
  type TaskAttachmentRecord,
} from "@/features/tasks/lib/map-task-attachment-row";
import {
  mapTaskCommentRowToTaskComment,
  type TaskCommentRecord,
} from "@/features/tasks/lib/map-task-comment-row";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";

const taskIdSchema = z.uuid("Invalid task identifier.");

const TASK_COMMENTS_SELECT = `
  id,
  task_id,
  body,
  created_by,
  created_at,
  author_profile:profiles!task_comments_created_by_fkey(display_name)
`;

const TASK_ATTACHMENTS_SELECT = `
  id,
  task_id,
  storage_path,
  file_name,
  mime_type,
  size_bytes,
  uploaded_by,
  created_at,
  uploader_profile:profiles!task_attachments_uploaded_by_fkey(display_name)
`;

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
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
    const parsedBoardId = boardIdSchema.safeParse(
      new URL(request.url).searchParams.get("boardId"),
    );

    if (!parsedTaskId.success) {
      return NextResponse.json(
        { error: parsedTaskId.error.issues[0]?.message ?? "Invalid task ID." },
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
    await assertTaskInBoard(supabase, parsedTaskId.data, parsedBoardId.data);

    const [{ data: comments, error: commentsError }, { data: attachments, error: attachmentsError }] =
      await Promise.all([
        supabase
          .from("task_comments")
          .select(TASK_COMMENTS_SELECT)
          .eq("task_id", parsedTaskId.data)
          .order("created_at", { ascending: true }),
        supabase
          .from("task_attachments")
          .select(TASK_ATTACHMENTS_SELECT)
          .eq("task_id", parsedTaskId.data)
          .order("created_at", { ascending: false }),
      ]);

    if (commentsError) {
      return NextResponse.json({ error: commentsError.message }, { status: 400 });
    }

    if (attachmentsError) {
      return NextResponse.json(
        { error: attachmentsError.message },
        { status: 400 },
      );
    }

    const browserConfig = getSupabaseBrowserConfig();

    if (!browserConfig.isConfigured) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      comments: (comments as unknown as TaskCommentRecord[]).map(
        mapTaskCommentRowToTaskComment,
      ),
      attachments: (attachments as unknown as TaskAttachmentRecord[]).map(
        (attachment) =>
          mapTaskAttachmentRowToTaskAttachment(attachment, browserConfig.url),
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load task details.",
      },
      { status: 500 },
    );
  }
}
