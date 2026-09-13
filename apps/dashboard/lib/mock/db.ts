/**
 * En delad mock-databas per serverprocess, seedad med de tre exempelminnena
 * i docs/testexempel.md för varje mock-konto. Olika id per konto så att
 * isolering mellan konton syns i dashboarden.
 */
import { MOCK_ACCOUNTS } from "./accounts";
import { MockMemoryStore } from "./store";
import type { Memory } from "../types";

const EXAMPLES: Array<Omit<Memory, "id" | "created_at" | "updated_at">> = [
  {
    project: "Projekt A",
    category: "deadline",
    title: "Lanseringsdatum",
    content: "Vi lanserar 15 oktober 2026.",
  },
  {
    project: "Projekt A",
    category: "decision",
    title: "Stack för V1",
    content: "V1 kör TypeScript på Vercel och Supabase. Ingen Python-worker.",
  },
  {
    project: "Projekt A",
    category: "fact",
    title: "Tre testkonton",
    content: "Det finns tre förskapade konton. Ingen offentlig registrering.",
  },
];

function seed() {
  const rows: Array<Memory & { user_id: string }> = [];
  MOCK_ACCOUNTS.forEach((account, a) => {
    EXAMPLES.forEach((example, i) => {
      // Fasta, giltiga UUID v4 i mocken, så samma rad har samma id mellan hämtningar.
      const id = `a${a}b${i}0000-0000-4000-8000-${String(a * 10 + i).padStart(12, "0")}`;
      const stamp = `2026-09-1${i}T1${a}:00:00Z`;
      rows.push({ id, user_id: account.id, ...example, created_at: stamp, updated_at: stamp });
    });
  });
  return rows;
}

declare global {
  var __dashboardMockStore: MockMemoryStore | undefined;
}

// globalThis så att Next dev (hot reload) inte skapar en ny tom databas per modulladdning.
export const mockDb: MockMemoryStore =
  globalThis.__dashboardMockStore ?? (globalThis.__dashboardMockStore = new MockMemoryStore(seed()));
