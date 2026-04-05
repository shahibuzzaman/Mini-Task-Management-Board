import { z } from "zod";

export const boardIdSchema = z.uuid("Invalid board identifier.");

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Board name must be at least 2 characters.")
    .max(60, "Board name must be 60 characters or fewer."),
});

export const updateBoardSchema = createBoardSchema;
