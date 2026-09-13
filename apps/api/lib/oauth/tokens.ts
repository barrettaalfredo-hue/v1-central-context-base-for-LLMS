export function accessTokenExpiresIn(accessToken: string, fallbackSeconds = 300) {
  try {
    const segment = accessToken.split(".")[1];
    if (!segment) return fallbackSeconds;
    const payload = JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as {
      exp?: number;
    };
    if (typeof payload.exp !== "number") return fallbackSeconds;
    return Math.max(30, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    return fallbackSeconds;
  }
}
