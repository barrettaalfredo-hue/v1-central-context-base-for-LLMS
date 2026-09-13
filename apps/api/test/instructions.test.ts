import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { CLAUDE_INSTRUCTIONS } from "../lib/claude-instructions";

/**
 * Test 13 och 16 i docs/torsdag-test.md kräver att texten i guiden är byte-lik blocket i
 * docs/claude-instruktioner.md. Det här testet faller om Melker ändrar blocket och
 * dashboarden inte hänger med.
 */
describe("anslutningsguidens instruktionstext", () => {
  it("är byte-lik kodblocket i docs/claude-instruktioner.md", () => {
    // Windows-git checkar ut med CRLF (core.autocrlf=true). Normalisera före jämförelse.
    const doc = readFileSync(join(__dirname, "../../../docs/claude-instruktioner.md"), "utf8").replace(
      /\r\n/g,
      "\n",
    );
    const match = doc.match(/^```\n([\s\S]*?)\n```/m);
    assert.ok(match, "hittade inget kodblock i docs/claude-instruktioner.md");
    assert.equal(CLAUDE_INSTRUCTIONS, match[1]);
  });

  it("nämner de tre verktygen i singular och inget user_id-fält", () => {
    for (const tool of ["search_memory", "save_memory", "update_memory"]) {
      assert.ok(CLAUDE_INSTRUCTIONS.includes(tool), tool);
    }
    assert.ok(!/searchMemories|saveMemories/.test(CLAUDE_INSTRUCTIONS.replace(/Anropa inte[^\n]*/g, "")));
  });
});
