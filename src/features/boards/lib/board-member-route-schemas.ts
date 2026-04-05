import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";

export const addBoardMemberSchema = z.object({
  boardId: boardIdSchema,
  email: z.email("Enter a valid email address."),
});

export const updateBoardMemberSchema = z.object({
  boardId: boardIdSchema,
  role: z.enum(["admin", "member"]),
});
