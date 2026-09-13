import assert from "node:assert/strict";
import { test } from "node:test";
import { createInMemoryStore } from "../src/in-memory";
import { PAGE_SIZE, cleanSearchQuery, createMemoryApi } from "../src/store";
import { DEADLINE, DECISION, USER_A } from "./fixtures";

test("strips percent underscore comma parens to spaces", () => {
  assert.equal(cleanSearchQuery("%oktober%"), "oktober");
  assert.equal(cleanSearchQuery("foo%bar"), "foo bar");
  assert.equal(cleanSearchQuery("a_b,c(d)e"), "a b c d e");
});

test("only specials means no text filter", async () => {
  const memory = createMemoryApi(createInMemoryStore());
  await memory.saveMemory(USER_A, DEADLINE);
  await memory.saveMemory(USER_A, DECISION);
  const found = await memory.searchMemory(USER_A, { query: "%_(), " });
  assert.ok("data" in found);
  assert.equal(found.data.length, 2);
});

test("query case insensitive", async () => {
  const memory = createMemoryApi(createInMemoryStore());
  await memory.saveMemory(USER_A, DEADLINE);
  const found = await memory.searchMemory(USER_A, { query: "Oktober" });
  assert.ok("data" in found);
  assert.equal(found.data.length, 1);
  assert.equal(found.data[0]?.title, "Lanseringsdatum");
});

test("project case sensitive", async () => {
  const memory = createMemoryApi(createInMemoryStore());
  await memory.saveMemory(USER_A, DEADLINE);
  const found = await memory.searchMemory(USER_A, { project: "Projekt a" });
  assert.ok("data" in found);
  assert.deepEqual(found.data, []);
});

test("returns at most 50", async () => {
  let tick = Date.parse("2026-09-10T12:00:00Z");
  const memory = createMemoryApi(
    createInMemoryStore({
      now: () => {
        const date = new Date(tick);
        tick += 1000;
        return date;
      },
    }),
  );
  for (let i = 0; i < PAGE_SIZE + 1; i += 1) {
    const saved = await memory.saveMemory(USER_A, {
      project: "Projekt A",
      category: "fact",
      title: `Rad ${i}`,
      content: `Innehåll ${i}`,
    });
    assert.ok("data" in saved);
  }
  const page = await memory.searchMemory(USER_A, {});
  assert.ok("data" in page);
  assert.equal(page.data.length, PAGE_SIZE);
});

test("listByUser throw is SEARCH_FAILED", async () => {
  const store = createInMemoryStore();
  const memory = createMemoryApi({
    ...store,
    async listByUser() {
      throw new Error("boom");
    },
  });
  const result = await memory.searchMemory(USER_A, {});
  assert.ok("error" in result);
  assert.equal(result.error.code, "SEARCH_FAILED");
  assert.equal(result.error.message, "Kunde inte söka minnen.");
});

test("offset skips in updated_at desc", async () => {
  let tick = Date.parse("2026-09-10T12:00:00Z");
  const memory = createMemoryApi(
    createInMemoryStore({
      now: () => {
        const date = new Date(tick);
        tick += 1000;
        return date;
      },
    }),
  );
  for (let i = 0; i < 3; i += 1) {
    const saved = await memory.saveMemory(USER_A, {
      project: "Projekt A",
      category: "fact",
      title: `Rad ${i}`,
      content: `Innehåll ${i}`,
    });
    assert.ok("data" in saved);
  }
  const first = await memory.searchMemory(USER_A, { offset: 0 });
  const rest = await memory.searchMemory(USER_A, { offset: 1 });
  assert.ok("data" in first && "data" in rest);
  assert.equal(first.data[0]?.title, "Rad 2");
  assert.equal(rest.data[0]?.title, "Rad 1");
  assert.equal(rest.data.length, 2);
});
