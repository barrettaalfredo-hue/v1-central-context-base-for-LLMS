import { describe, expect, it } from "vitest";
import {
  isMemoryError,
  validateMemoryId,
  validateMemoryInput,
  validateSearchInput,
} from "../src/index.js";
import { DEADLINE, USER_A } from "./fixtures.js";
import { makeTestStore } from "./helpers.js";

describe("validateMemoryInput", () => {
  it("godkänner giltig indata och trimmar fälten", () => {
    const result = validateMemoryInput({
      project: "  Projekt A  ",
      category: "deadline",
      title: "  Lanseringsdatum  ",
      content: "  Vi lanserar 15 oktober 2026.  ",
    });
    expect(isMemoryError(result)).toBe(false);
    expect(result).toMatchObject({
      project: "Projekt A",
      title: "Lanseringsdatum",
      content: "Vi lanserar 15 oktober 2026.",
      category: "deadline",
    });
  });

  it("ger INVALID_CATEGORY för ogiltig kategori", () => {
    const result = validateMemoryInput({ ...DEADLINE, category: "topic" });
    expect(result).toEqual({
      error: { code: "INVALID_CATEGORY", message: expect.any(String) },
    });
  });

  it("räknar titel med bara blanksteg som tom (INVALID_TITLE)", () => {
    const result = validateMemoryInput({ ...DEADLINE, title: "   " });
    expect(isMemoryError(result) && result.error.code).toBe("INVALID_TITLE");
  });

  it("avvisar project över 100 tecken", () => {
    const result = validateMemoryInput({ ...DEADLINE, project: "a".repeat(101) });
    expect(isMemoryError(result) && result.error.code).toBe("INVALID_PROJECT");
  });

  it("avvisar content över 10 000 tecken", () => {
    const result = validateMemoryInput({
      ...DEADLINE,
      content: "a".repeat(10_001),
    });
    expect(isMemoryError(result) && result.error.code).toBe("INVALID_CONTENT");
  });

  it("returnerar första felet i ordningen project, title, content, category", () => {
    const result = validateMemoryInput({
      project: "",
      title: "",
      content: "",
      category: "nope",
    });
    expect(isMemoryError(result) && result.error.code).toBe("INVALID_PROJECT");
  });
});

describe("validateMemoryId", () => {
  it("godkänner ett UUID", () => {
    expect(validateMemoryId(USER_A)).toEqual({ id: USER_A });
  });

  it("avvisar icke-UUID med INVALID_ID", () => {
    expect(validateMemoryId("inte-ett-uuid")).toEqual({
      error: { code: "INVALID_ID", message: expect.any(String) },
    });
  });
});

describe("validateSearchInput", () => {
  it("godkänner tom indata (offset 0)", () => {
    const result = validateSearchInput({});
    expect(result).toMatchObject({ offset: 0 });
  });

  it("avvisar negativt offset", () => {
    expect(validateSearchInput({ offset: -1 })).toEqual({
      error: { code: "INVALID_OFFSET", message: expect.any(String) },
    });
  });

  it("avvisar icke-heltal som offset", () => {
    expect(validateSearchInput({ offset: 1.5 })).toEqual({
      error: { code: "INVALID_OFFSET", message: expect.any(String) },
    });
  });

  it("städar bort %, _, ',', '(' och ')' ur query och gör gemener", () => {
    const result = validateSearchInput({ query: "OKT(_%,)ober" });
    expect(isMemoryError(result)).toBe(false);
    if (!isMemoryError(result)) {
      expect(result.query).toBe("oktober");
    }
  });

  it("query som bara innehåller specialtecken blir inget textfilter", () => {
    const result = validateSearchInput({ query: "%_,()" });
    if (!isMemoryError(result)) {
      expect(result.query).toBeUndefined();
    }
  });
});

describe("INVALID_OFFSET stoppar sökning", () => {
  it("returnerar fel i stället för lista", () => {
    const { store } = makeTestStore();
    const result = store.searchMemory(USER_A, { offset: -5 });
    expect(isMemoryError(result)).toBe(true);
  });
});
