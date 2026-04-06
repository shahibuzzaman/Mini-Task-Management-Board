import { NextResponse } from "next/server";
import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { getCurrentBoardAccess } from "@/features/boards/lib/get-current-board-access";
import { TASK_ATTACHMENTS_BUCKET } from "@/features/tasks/lib/task-attachments";
import {
  mapTaskRowToTask,
  type TaskRecord,
} from "@/features/tasks/lib/map-task-row-to-task";
import { updateTaskRouteSchema } from "@/features/tasks/lib/task-route-schemas";
import { validateTaskAssignee } from "@/features/tasks/lib/validate-task-assignee";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

const taskIdSchema = z.uuid("Invalid task identifier.");

type TaskRouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

type TaskAttachmentRow = {
  storage_path: string;
};

type DeletedTaskRow = {
  id: string;
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
    await validateTaskAssignee(
      supabase,
      parsedBoardId.data,
      parsedBody.data.assigneeId ?? null,
    );

    const { data, error } = await supabase
      .from("tasks")
      .update({
        title: parsedBody.data.title,
        description: parsedBody.data.description,
        status: parsedBody.data.status,
        priority: parsedBody.data.priority,
        due_at: parsedBody.data.dueAt,
        labels: parsedBody.data.labels,
        assignee_id: parsedBody.data.assigneeId,
        position: parsedBody.data.position,
      })
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

export async function DELETE(request: Request, context: TaskRouteContext) {
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

    const board = await getCurrentBoardAccess(supabase, user.id, parsedBoardId.data);

    if (board.archivedAt) {
      return NextResponse.json(
        { error: "Archived boards are read-only." },
        { status: 400 },
      );
    }

    const { data: attachments, error: attachmentsError } = await supabase
      .from("task_attachments")
      .select("storage_path")
      .eq("task_id", parsedTaskId.data)
      .returns<TaskAttachmentRow[]>();

    if (attachmentsError) {
      return NextResponse.json({ error: attachmentsError.message }, { status: 400 });
    }

    const storagePaths =
      attachments?.map((attachment) => attachment.storage_path).filter(Boolean) ?? [];

    if (storagePaths.length > 0) {
      const { error: storageError } = await adminClient.storage
        .from(TASK_ATTACHMENTS_BUCKET)
        .remove(storagePaths);

      if (storageError) {
        return NextResponse.json({ error: storageError.message }, { status: 400 });
      }
    }

    const { data: deletedTask, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", parsedTaskId.data)
      .eq("board_id", parsedBoardId.data)
      .select("id")
      .maybeSingle<DeletedTaskRow>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!deletedTask) {
      return NextResponse.json(
        { error: "Task could not be deleted." },
        { status: 403 },
      );
    }

    return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to delete the task.",
      },
      { status: 500 },
    );
  }
}
