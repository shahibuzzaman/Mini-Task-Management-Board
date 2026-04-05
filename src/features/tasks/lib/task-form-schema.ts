import { z } from "zod";

export const taskFormSchema = z.object({
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
  dueAt: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || !Number.isNaN(new Date(value).getTime()),
      "Enter a valid due date.",
    ),
  labels: z
    .string()
    .trim()
    .max(200, "Labels must be 200 characters or fewer."),
  assigneeId: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || z.uuid().safeParse(value).success,
      "Select a valid assignee.",
    ),
});

export type TaskFormSchema = z.infer<typeof taskFormSchema>;
