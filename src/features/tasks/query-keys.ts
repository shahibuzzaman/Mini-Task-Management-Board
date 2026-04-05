export const tasksQueryKeys = {
  all: ["tasks"] as const,
  list: (boardId: string) => [...tasksQueryKeys.all, "list", boardId] as const,
};
