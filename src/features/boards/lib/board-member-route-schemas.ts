import { z } from "zod";

export const addBoardMemberSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const updateBoardMemberSchema = z.object({
  role: z.enum(["owner", "member"]),
});
