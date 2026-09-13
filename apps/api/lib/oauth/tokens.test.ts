import assert from "node:assert/strict";
import { test } from "node:test";
import { accessTokenExpiresIn } from "./tokens";

function jwtWithExp(exp: number) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  return `${header}.${payload}.x`;
}

test("expires_in follows the JWT exp claim", () => {
  const seconds = accessTokenExpiresIn(jwtWithExp(Math.floor(Date.now() / 1000) + 300));
  assert.ok(seconds >= 290 && seconds <= 300);
});

test("falls back when the token is not a JWT", () => {
  assert.equal(accessTokenExpiresIn("not-a-jwt", 180), 180);
});
