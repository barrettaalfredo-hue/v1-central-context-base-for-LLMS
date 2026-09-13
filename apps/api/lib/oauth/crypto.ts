import { createHash, randomBytes } from "node:crypto";

export function pkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function randomToken() {
  return randomBytes(32).toString("base64url");
}
