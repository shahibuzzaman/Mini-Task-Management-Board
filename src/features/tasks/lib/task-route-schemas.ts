import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";

const taskPayloadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Title must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(500, "Description must be 500 characters or fewer."),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  dueAt: z.string().datetime().nullable(),
  labels: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Labels cannot be empty.")
        .max(24, "Labels must be 24 characters or fewer."),
    )
    .max(8, "No more than 8 labels are supported."),
  assigneeId: z.uuid("Select a valid assignee.").nullable(),
});

export const createTaskRouteSchema = taskPayloadSchema.extend({
  boardId: boardIdSchema,
  position: z.number().finite(),
});

export const updateTaskRouteSchema = taskPayloadSchema
  .partial()
  .extend({
    position: z.number().finite().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.status !== undefined ||
      value.position !== undefined,
    {
      message: "Provide at least one task field to update.",
    },
  );
