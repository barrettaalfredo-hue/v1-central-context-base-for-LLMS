import assert from "node:assert/strict";
import { test } from "node:test";
import {
  validateMemoryId,
  validateMemoryInput,
  validateSearchInput,
} from "./validate";

test("rejects invalid category and does not look like success", () => {
  const result = validateMemoryInput({
    project: "Projekt A",
    category: "nope",
    title: "Lanseringsdatum",
    content: "Vi lanserar 15 oktober 2026.",
  });
  assert.ok("error" in result);
  assert.equal(result.error.code, "INVALID_CATEGORY");
});

test("accepts the locked test fixture", () => {
  const result = validateMemoryInput({
    project: "Projekt A",
    category: "deadline",
    title: "Lanseringsdatum",
    content: "Vi lanserar 15 oktober 2026.",
  });
  assert.ok("data" in result);
  assert.equal(result.data.category, "deadline");
});

test("search miss query is still valid", () => {
  const result = validateSearchInput({ query: "finns-inte-xyz" });
  assert.ok("data" in result);
  assert.equal(result.data.query, "finns-inte-xyz");
});

test("rejects a non-uuid id", () => {
  const result = validateMemoryId("not-an-id");
  assert.ok("error" in result);
  assert.equal(result.error.code, "INVALID_ID");
});
