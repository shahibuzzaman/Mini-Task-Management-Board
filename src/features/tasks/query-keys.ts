export const tasksQueryKeys = {
  all: ["tasks"] as const,
  list: (boardId: string) => [...tasksQueryKeys.all, "list", boardId] as const,
  details: (boardId: string, taskId: string) =>
    [...tasksQueryKeys.all, "details", boardId, taskId] as const,
};
