import { describe, expect, it } from "vitest";
import { isMemoryError, type Memory } from "../src/index.js";
import { DEADLINE, DECISION, FACT, USER_A, USER_B } from "./fixtures.js";
import { makeTestStore } from "./helpers.js";

function asMemory(value: Memory | { error: unknown }): Memory {
  if (isMemoryError(value)) {
    throw new Error(`Förväntade minne, fick fel: ${JSON.stringify(value)}`);
  }
  return value;
}

describe("saveMemory", () => {
  it("skapar minne med id, tidsstämplar och rätt format (ingen user_id i svaret)", () => {
    const { store } = makeTestStore();
    const saved = asMemory(store.saveMemory(USER_A, DEADLINE));

    expect(saved.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(saved.created_at).toBe("2026-09-10T12:00:00Z");
    expect(saved.updated_at).toBe("2026-09-10T12:00:00Z");
    expect(saved).not.toHaveProperty("user_id");
    expect(saved).toMatchObject({
      project: "Projekt A",
      category: "deadline",
      title: "Lanseringsdatum",
      content: "Vi lanserar 15 oktober 2026.",
    });
  });

  it("tidsstämplar saknar millisekunder", () => {
    const { store } = makeTestStore("2026-09-10T12:00:00.123Z");
    const saved = asMemory(store.saveMemory(USER_A, DEADLINE));
    expect(saved.created_at).toBe("2026-09-10T12:00:00Z");
  });

  it("ogiltig kategori ger fel och sparar ingen rad", () => {
    const { store } = makeTestStore();
    const result = store.saveMemory(USER_A, { ...DEADLINE, category: "bad" });
    expect(isMemoryError(result)).toBe(true);
    const list = store.searchMemory(USER_A, {});
    expect(Array.isArray(list) && list.length).toBe(0);
  });

  it("identisk omsparning skapar ingen dubblett och behåller id + updated_at", () => {
    const { store, clock } = makeTestStore();
    const first = asMemory(store.saveMemory(USER_A, DEADLINE));

    clock.advance(60);
    const second = asMemory(store.saveMemory(USER_A, DEADLINE));

    expect(second.id).toBe(first.id);
    expect(second.updated_at).toBe(first.updated_at);

    const list = store.searchMemory(USER_A, {});
    expect(Array.isArray(list) && list.length).toBe(1);
  });
});

describe("searchMemory", () => {
  it("hittar via project, category och query (träff i content)", () => {
    const { store } = makeTestStore();
    store.saveMemory(USER_A, DEADLINE);

    const byProject = store.searchMemory(USER_A, { project: "Projekt A" });
    expect(Array.isArray(byProject) && byProject.length).toBe(1);

    const byCategory = store.searchMemory(USER_A, { category: "deadline" });
    expect(asMemory((byCategory as Memory[])[0]!).title).toBe("Lanseringsdatum");

    const byQuery = store.searchMemory(USER_A, { query: "oktober" });
    expect(asMemory((byQuery as Memory[])[0]!).title).toBe("Lanseringsdatum");
  });

  it("query utan träff ger tom lista, inte fel", () => {
    const { store } = makeTestStore();
    store.saveMemory(USER_A, DEADLINE);
    const result = store.searchMemory(USER_A, { query: "finns-inte-xyz" });
    expect(isMemoryError(result)).toBe(false);
    expect(Array.isArray(result) && result.length).toBe(0);
  });

  it("query är skiftlägesokänsligt", () => {
    const { store } = makeTestStore();
    store.saveMemory(USER_A, DEADLINE);
    const result = store.searchMemory(USER_A, { query: "OKTOBER" });
    expect(Array.isArray(result) && result.length).toBe(1);
  });

  it("project och category matchar exakt och skiftlägeskänsligt", () => {
    const { store } = makeTestStore();
    store.saveMemory(USER_A, DEADLINE);
    const wrongCase = store.searchMemory(USER_A, { project: "projekt a" });
    expect(Array.isArray(wrongCase) && wrongCase.length).toBe(0);
  });

  it("sorterar senast uppdaterat först", () => {
    const { store, clock } = makeTestStore();
    store.saveMemory(USER_A, DEADLINE);
    clock.advance(1);
    store.saveMemory(USER_A, DECISION);
    clock.advance(1);
    store.saveMemory(USER_A, FACT);

    const list = store.searchMemory(USER_A, {}) as Memory[];
    expect(list.map((m) => m.title)).toEqual([
      "Tre testkonton",
      "Stack för V1",
      "Lanseringsdatum",
    ]);
  });

  it("returnerar högst 50 per anrop och sidindexerar med offset", () => {
    const { store, clock } = makeTestStore();
    for (let i = 0; i < 55; i++) {
      clock.advance(1);
      store.saveMemory(USER_A, {
        ...DEADLINE,
        title: `Minne ${i}`,
      });
    }
    const page1 = store.searchMemory(USER_A, {}) as Memory[];
    const page2 = store.searchMemory(USER_A, { offset: 50 }) as Memory[];
    expect(page1.length).toBe(50);
    expect(page2.length).toBe(5);
    // Ingen överlappning mellan sidorna.
    const ids = new Set([...page1, ...page2].map((m) => m.id));
    expect(ids.size).toBe(55);
  });
});

describe("updateMemory", () => {
  it("uppdaterar content via id, behåller id, ger nyare updated_at och hamnar först", () => {
    const { store, clock } = makeTestStore();
    const saved = asMemory(store.saveMemory(USER_A, DEADLINE));
    store.saveMemory(USER_A, DECISION);

    clock.advance(120);
    const updated = asMemory(
      store.updateMemory(USER_A, {
        id: saved.id,
        project: DEADLINE.project,
        category: DEADLINE.category,
        title: DEADLINE.title,
        content: "Vi lanserar 22 oktober 2026.",
      }),
    );

    expect(updated.id).toBe(saved.id);
    expect(updated.content).toBe("Vi lanserar 22 oktober 2026.");
    expect(updated.updated_at > saved.updated_at).toBe(true);
    expect(updated.created_at).toBe(saved.created_at);

    const list = store.searchMemory(USER_A, {}) as Memory[];
    expect(list[0]!.id).toBe(saved.id);

    // Ingen andra rad med den gamla texten.
    const oldText = store.searchMemory(USER_A, { query: "15 oktober" }) as Memory[];
    expect(oldText.length).toBe(0);
  });

  it("okänt id ger NOT_FOUND", () => {
    const { store } = makeTestStore();
    const result = store.updateMemory(USER_A, {
      id: "99999999-9999-4999-8999-999999999999",
      ...DEADLINE,
    });
    expect(isMemoryError(result) && result.error.code).toBe("NOT_FOUND");
  });

  it("ogiltigt id ger INVALID_ID", () => {
    const { store } = makeTestStore();
    const result = store.updateMemory(USER_A, { id: "abc", ...DEADLINE });
    expect(isMemoryError(result) && result.error.code).toBe("INVALID_ID");
  });
});

describe("isolering mellan konton", () => {
  it("Konto B ser inte Konto A:s minne", () => {
    const { store } = makeTestStore();
    store.saveMemory(USER_A, DEADLINE);

    const bList = store.searchMemory(USER_B, {}) as Memory[];
    expect(bList.length).toBe(0);
  });

  it("Konto B kan inte uppdatera Konto A:s minne (samma NOT_FOUND som okänt id)", () => {
    const { store } = makeTestStore();
    const saved = asMemory(store.saveMemory(USER_A, DEADLINE));

    const result = store.updateMemory(USER_B, {
      id: saved.id,
      ...DEADLINE,
      content: "Kapad text",
    });
    expect(isMemoryError(result) && result.error.code).toBe("NOT_FOUND");

    // Konto A:s rad är oförändrad.
    const aList = store.searchMemory(USER_A, {}) as Memory[];
    expect(aList[0]!.content).toBe("Vi lanserar 15 oktober 2026.");
  });
});
