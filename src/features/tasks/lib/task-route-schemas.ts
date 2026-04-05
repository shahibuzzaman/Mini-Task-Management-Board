import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";
import { taskFormSchema } from "@/features/tasks/lib/task-form-schema";

export const createTaskRouteSchema = taskFormSchema.extend({
  boardId: boardIdSchema,
  position: z.number().finite(),
});

export const updateTaskRouteSchema = taskFormSchema
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
