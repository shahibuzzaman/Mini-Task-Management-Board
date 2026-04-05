export function getAuthRedirectPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/board";
  }

  if (nextPath.startsWith("//")) {
    return "/board";
  }

  return nextPath;
}
