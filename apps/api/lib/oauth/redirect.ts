export function isNativeLoopbackRedirect(redirectUri: string) {
  try {
    const url = new URL(redirectUri);
    const host = url.hostname.replace(/^\[|\]$/g, "");
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      (host === "127.0.0.1" || host === "localhost" || host === "::1")
    );
  } catch {
    return false;
  }
}

export function redirectAllowed(redirectUris: string[], redirectUri: string) {
  return redirectUris.includes(redirectUri) || isNativeLoopbackRedirect(redirectUri);
}
