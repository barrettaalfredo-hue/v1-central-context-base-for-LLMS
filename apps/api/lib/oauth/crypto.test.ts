import assert from "node:assert/strict";
import { test } from "node:test";
import { pkceChallenge } from "./crypto";

test("PKCE S256 is stable for a known verifier", () => {
  const challenge = pkceChallenge("test-verifier-value");
  assert.equal(challenge, pkceChallenge("test-verifier-value"));
  assert.notEqual(challenge, pkceChallenge("other"));
});
