export const tasksQueryKeys = {
  all: ["tasks"] as const,
  list: () => [...tasksQueryKeys.all, "list"] as const,
};
