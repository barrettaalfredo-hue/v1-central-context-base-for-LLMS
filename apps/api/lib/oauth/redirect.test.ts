import assert from "node:assert/strict";
import { test } from "node:test";
import { redirectAllowed } from "./redirect";

test("allows the registered redirect URI", () => {
  assert.equal(
    redirectAllowed(["https://claude.ai/api/mcp/auth_callback"], "https://claude.ai/api/mcp/auth_callback"),
    true,
  );
});

test("allows native loopback redirects", () => {
  assert.equal(redirectAllowed(["https://claude.ai/api/mcp/auth_callback"], "http://127.0.0.1:8734/callback"), true);
  assert.equal(redirectAllowed([], "http://localhost:3000/cb"), true);
});

test("rejects other hosts", () => {
  assert.equal(redirectAllowed(["https://claude.ai/api/mcp/auth_callback"], "https://evil.example/cb"), false);
});
