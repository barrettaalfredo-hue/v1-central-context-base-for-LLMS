import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { denyUrl } from "../components/OAuthApproveView";

describe("Neka-länken", () => {
  it("skickar error=access_denied och state till redirect_uri, behåller befintlig query", () => {
    const u = new URL(denyUrl("https://claude.ai/api/mcp/auth_callback?x=1", "abc"));
    assert.equal(u.origin + u.pathname, "https://claude.ai/api/mcp/auth_callback");
    assert.equal(u.searchParams.get("x"), "1");
    assert.equal(u.searchParams.get("error"), "access_denied");
    assert.equal(u.searchParams.get("state"), "abc");
  });
  it("blir # vid ogiltig redirect_uri", () => {
    assert.equal(denyUrl("inte en url", ""), "#");
  });
});
