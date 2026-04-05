import { z } from "zod";
import { boardIdSchema } from "@/features/boards/lib/board-route-schemas";

export const createBoardInvitationSchema = z.object({
  boardId: boardIdSchema,
  email: z.email("Enter a valid email address."),
  role: z.enum(["admin", "member"]).default("member"),
});

export const updateBoardInvitationSchema = z.object({
  boardId: boardIdSchema,
  role: z.enum(["admin", "member"]).optional(),
  action: z.enum(["resend"]).optional(),
});
