import assert from "node:assert/strict";
import { test } from "node:test";
import { asMcpSession } from "./session-parse";

const row = {
  user_id: "a9625693-0207-4f2b-bf34-f65964eaa346",
  supabase_access: "access",
  supabase_refresh: "refresh",
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
