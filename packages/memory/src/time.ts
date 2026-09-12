/**
 * Tidsstämpel enligt kontraktet: UTC, exakt `YYYY-MM-DDTHH:MM:SSZ`.
 * Millisekunder utelämnas.
 */
export function formatTimestamp(date: Date): string {
  // toISOString() ger t.ex. 2026-09-10T12:00:00.000Z – klipp bort millisekunderna.
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Standardklocka som använder riktig tid. */
export function defaultNow(): Date {
  return new Date();
}
