export const boardsQueryKeys = {
  all: ["boards"] as const,
  members: (boardId: string) => [...boardsQueryKeys.all, "members", boardId] as const,
};
