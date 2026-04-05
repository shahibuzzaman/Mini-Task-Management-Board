import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { assertTaskInBoard } from "@/features/tasks/lib/assert-task-in-board";
import { TASK_ATTACHMENTS_BUCKET } from "@/features/tasks/lib/task-attachments";

const taskIdSchema = z.uuid("Invalid task identifier.");
const attachmentIdSchema = z.uuid("Invalid attachment identifier.");

type RouteContext = {
  params: Promise<{
    taskId: string;
    attachmentId: string;
  }>;
};

type AttachmentRow = {
  storage_path: string;
};

export async function DELETE(request: Request, context: RouteContext) {
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

    const { taskId, attachmentId } = await context.params;
    const parsedTaskId = taskIdSchema.safeParse(taskId);
    const parsedAttachmentId = attachmentIdSchema.safeParse(attachmentId);
    const parsedBoardId = boardIdSchema.safeParse(
      new URL(request.url).searchParams.get("boardId"),
    );

    if (!parsedTaskId.success) {
      return NextResponse.json(
        { error: parsedTaskId.error.issues[0]?.message ?? "Invalid task ID." },
        { status: 400 },
      );
    }

    if (!parsedAttachmentId.success) {
      return NextResponse.json(
        {
          error:
            parsedAttachmentId.error.issues[0]?.message ?? "Invalid attachment ID.",
        },
        { status: 400 },
      );
    }

    if (!parsedBoardId.success) {
      return NextResponse.json(
        { error: parsedBoardId.error.issues[0]?.message ?? "Invalid board ID." },
        { status: 400 },
      );
    }

    const board = await getCurrentBoardAccess(supabase, user.id, parsedBoardId.data);
    await assertTaskInBoard(supabase, parsedTaskId.data, parsedBoardId.data);

    if (board.archivedAt) {
      return NextResponse.json(
        { error: "Archived boards are read-only." },
        { status: 400 },
      );
    }

    const { data: attachment, error: attachmentError } = await supabase
      .from("task_attachments")
      .select("storage_path")
      .eq("id", parsedAttachmentId.data)
      .eq("task_id", parsedTaskId.data)
      .single<AttachmentRow>();

    if (attachmentError) {
      return NextResponse.json(
        { error: attachmentError.message },
        { status: 404 },
      );
    }

    const { error: storageError } = await adminClient.storage
      .from(TASK_ATTACHMENTS_BUCKET)
      .remove([attachment.storage_path]);

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 400 });
    }

    const { error } = await supabase
      .from("task_attachments")
      .delete()
      .eq("id", parsedAttachmentId.data)
      .eq("task_id", parsedTaskId.data);

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
            : "Unable to remove the attachment.",
      },
      { status: 500 },
    );
  }
}
