"use client";

const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";

export function getAuthCallbackUrl(nextPath?: string): string {
  const callbackUrl = new URL("/auth/callback", window.location.origin);

  if (nextPath && nextPath !== DEFAULT_AUTH_REDIRECT_PATH) {
    callbackUrl.searchParams.set("next", nextPath);
  }

  return callbackUrl.toString();
}
