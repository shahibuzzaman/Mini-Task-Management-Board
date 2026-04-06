export function getAuthRedirectPath(nextPath: string | null): string {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/dashboard";
  }

  if (nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}
