export const boardsQueryKeys = {
  all: ["boards"] as const,
  list: () => [...boardsQueryKeys.all, "list"] as const,
  members: (boardId: string) => [...boardsQueryKeys.all, "members", boardId] as const,
  invitations: (boardId: string) =>
    [...boardsQueryKeys.all, "invitations", boardId] as const,
};
