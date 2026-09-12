import type { MemoryInput } from "../src/index.js";

/** Gemensamma testdata från docs/testexempel.md. */

export const DEADLINE: MemoryInput = {
  project: "Projekt A",
  category: "deadline",
  title: "Lanseringsdatum",
  content: "Vi lanserar 15 oktober 2026.",
};

export const DECISION: MemoryInput = {
  project: "Projekt A",
  category: "decision",
  title: "Stack för V1",
  content: "V1 kör TypeScript på Vercel och Supabase. Ingen Python-worker.",
};

export const FACT: MemoryInput = {
  project: "Projekt A",
  category: "fact",
  title: "Tre testkonton",
  content: "Det finns tre förskapade konton. Ingen offentlig registrering.",
};

export const USER_A = "11111111-1111-4111-8111-111111111111";
export const USER_B = "22222222-2222-4222-8222-222222222222";
