import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mcpUrl } from "../lib/claude-instructions";

describe("mcpUrl", () => {
  it("använder NEXT_PUBLIC_MCP_URL om den är satt", () => {
    const prevMcp = process.env.NEXT_PUBLIC_MCP_URL;
    const prevVercel = process.env.VERCEL_URL;
    process.env.NEXT_PUBLIC_MCP_URL = "https://example.test/api/mcp";
    process.env.VERCEL_URL = "ignored.vercel.app";
    try {
      assert.equal(mcpUrl(), "https://example.test/api/mcp");
    } finally {
      if (prevMcp === undefined) delete process.env.NEXT_PUBLIC_MCP_URL;
      else process.env.NEXT_PUBLIC_MCP_URL = prevMcp;
      if (prevVercel === undefined) delete process.env.VERCEL_URL;
      else process.env.VERCEL_URL = prevVercel;
    }
  });

  it("faller tillbaka på VERCEL_URL", () => {
    const prevMcp = process.env.NEXT_PUBLIC_MCP_URL;
    const prevVercel = process.env.VERCEL_URL;
    delete process.env.NEXT_PUBLIC_MCP_URL;
    process.env.VERCEL_URL = "v1-preview.vercel.app";
    try {
      assert.equal(mcpUrl(), "https://v1-preview.vercel.app/api/mcp");
    } finally {
      if (prevMcp === undefined) delete process.env.NEXT_PUBLIC_MCP_URL;
      else process.env.NEXT_PUBLIC_MCP_URL = prevMcp;
      if (prevVercel === undefined) delete process.env.VERCEL_URL;
      else process.env.VERCEL_URL = prevVercel;
    }
  });
});
