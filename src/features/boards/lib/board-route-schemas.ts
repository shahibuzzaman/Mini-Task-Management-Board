import { z } from "zod";

export const boardIdSchema = z.uuid("Invalid board identifier.");
export const boardAccentColorSchema = z.enum([
  "sky",
  "emerald",
  "amber",
  "rose",
  "slate",
]);
export const boardInvitePolicySchema = z.enum(["admins_only", "members"]);
export const boardInviteRoleSchema = z.enum(["admin", "member"]);

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Board name must be at least 2 characters.")
    .max(60, "Board name must be 60 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(280, "Board description must be 280 characters or fewer.")
    .default(""),
  accentColor: boardAccentColorSchema.default("sky"),
  invitePolicy: boardInvitePolicySchema.default("admins_only"),
  defaultInviteRole: boardInviteRoleSchema.default("member"),
});

export const updateBoardSchema = createBoardSchema.extend({
  archivedAt: z.string().datetime().nullable().optional(),
});
