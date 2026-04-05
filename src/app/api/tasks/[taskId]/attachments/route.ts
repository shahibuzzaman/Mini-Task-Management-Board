import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseBrowserConfig } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { assertTaskInBoard } from "@/features/tasks/lib/assert-task-in-board";
import {
  mapTaskAttachmentRowToTaskAttachment,
  type TaskAttachmentRecord,
} from "@/features/tasks/lib/map-task-attachment-row";
import {
  sanitizeAttachmentFileName,
  TASK_ATTACHMENTS_BUCKET,
  TASK_ATTACHMENT_MAX_BYTES,
} from "@/features/tasks/lib/task-attachments";

const taskIdSchema = z.uuid("Invalid task identifier.");

const TASK_ATTACHMENT_SELECT = `
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

export async function POST(request: Request, context: RouteContext) {
  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 },
      );
    }

    const adminClient = createSupabaseAdminClient();
    const browserConfig = getSupabaseBrowserConfig();

    if (!adminClient || !browserConfig.isConfigured) {
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

    const { taskId } = await context.params;
    const parsedTaskId = taskIdSchema.safeParse(taskId);

    if (!parsedTaskId.success) {
      return NextResponse.json(
        { error: parsedTaskId.error.issues[0]?.message ?? "Invalid task ID." },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const parsedBoardId = boardIdSchema.safeParse(formData.get("boardId"));
    const file = formData.get("file");

    if (!parsedBoardId.success) {
      return NextResponse.json(
        { error: parsedBoardId.error.issues[0]?.message ?? "Invalid board ID." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Choose a file to upload." },
        { status: 400 },
      );
    }

    if (file.size > TASK_ATTACHMENT_MAX_BYTES) {
      return NextResponse.json(
        { error: "Files must be 10 MB or smaller." },
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

    const fileBuffer = new Uint8Array(await file.arrayBuffer());
    const fileName = sanitizeAttachmentFileName(file.name);
    const storagePath = `${board.id}/${parsedTaskId.data}/${randomUUID()}-${fileName}`;

    const { error: uploadError } = await adminClient.storage
      .from(TASK_ATTACHMENTS_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("task_attachments")
      .insert({
        task_id: parsedTaskId.data,
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        uploaded_by: user.id,
      })
      .select(TASK_ATTACHMENT_SELECT)
      .single();

    if (error) {
      await adminClient.storage.from(TASK_ATTACHMENTS_BUCKET).remove([storagePath]);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      mapTaskAttachmentRowToTaskAttachment(
        data as unknown as TaskAttachmentRecord,
        browserConfig.url,
      ),
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to upload the attachment.",
      },
      { status: 500 },
    );
  }
}
