import assert from "node:assert/strict";
import { test } from "node:test";
import { asMcpSession, asReusedMcpTokens } from "./session-parse";
import { MCP_ACCESS_SECONDS, MCP_REFRESH_SECONDS } from "./sessions";

const row = {
  user_id: "a9625693-0207-4f2b-bf34-f65964eaa346",
  supabase_access: "access",
  supabase_refresh: "refresh",
};

const reused = {
  ...row,
  access_token: "mcp-access",
  refresh_token: "mcp-refresh",
};

test("parses a jsonb session object", () => {
  assert.deepEqual(asMcpSession(row), row);
});

test("parses a jsonb session wrapped in an array or string", () => {
  assert.deepEqual(asMcpSession([row]), row);
  assert.deepEqual(asMcpSession(JSON.stringify(row)), row);
});

test("rejects incomplete session payloads", () => {
  assert.equal(asMcpSession(null), null);
  assert.equal(asMcpSession({ user_id: row.user_id }), null);
  assert.equal(asMcpSession("not-json"), null);
});

test("reuses the same MCP access and refresh tokens", () => {
  assert.deepEqual(asReusedMcpTokens(reused), reused);
  assert.deepEqual(asReusedMcpTokens([reused]), reused);
  assert.deepEqual(asReusedMcpTokens(JSON.stringify(reused)), reused);
  assert.deepEqual(asReusedMcpTokens({ oauth_reuse_session: reused }), reused);
});

test("MCP tokens are issued for ten years so Claude does not time out", () => {
  assert.equal(MCP_ACCESS_SECONDS, 10 * 365 * 24 * 60 * 60);
  assert.equal(MCP_REFRESH_SECONDS, MCP_ACCESS_SECONDS);
});
