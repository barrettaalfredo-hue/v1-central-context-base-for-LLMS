import assert from "node:assert/strict";
import { test } from "node:test";

test("MCP token lifetime is the signed 32-bit maximum so Claude does not expire it", async () => {
  const { MCP_ACCESS_SECONDS, MCP_REFRESH_SECONDS } = await import("./sessions");
  assert.equal(MCP_ACCESS_SECONDS, 2_147_483_647);
  assert.equal(MCP_REFRESH_SECONDS, MCP_ACCESS_SECONDS);
});
