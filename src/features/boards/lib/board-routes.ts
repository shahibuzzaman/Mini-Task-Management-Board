export type BoardSection = "board" | "members" | "invitations" | "settings";

export function getBoardsPath() {
  return "/boards";
}

export function getBoardPath(boardId: string) {
  return `${getBoardsPath()}/${boardId}`;
}

export function getBoardSectionPath(
  boardId: string,
  section: Exclude<BoardSection, "board">,
) {
  return `${getBoardPath(boardId)}/${section}`;
}
