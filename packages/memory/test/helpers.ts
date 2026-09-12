import { createMemoryStore } from "../src/index.js";

/** Kontrollerbar klocka för deterministiska tidsstämplar i tester. */
export function fakeClock(startISO = "2026-09-10T12:00:00Z") {
  let current = new Date(startISO).getTime();
  return {
    now: () => new Date(current),
    /** Flytta klockan framåt givet antal sekunder. */
    advance(seconds: number) {
      current += seconds * 1000;
    },
  };
}

let idCounter = 0;

/** Deterministisk UUID-generator för tester. */
export function sequentialIds() {
  idCounter = 0;
  return () => {
    idCounter += 1;
    const n = idCounter.toString(16).padStart(12, "0");
    return `00000000-0000-4000-8000-${n}`;
  };
}

/** Skapar en testlagring med kontrollerbar klocka och deterministiska id:n. */
export function makeTestStore(startISO?: string) {
  const clock = fakeClock(startISO);
  const store = createMemoryStore({ now: clock.now, idFactory: sequentialIds() });
  return { store, clock };
}
