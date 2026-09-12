/**
 * Delade typer för minnesfunktionerna. Format låst av docs/contracts.md.
 */

export const CATEGORIES = [
  "fact",
  "decision",
  "goal",
  "deadline",
  "preference",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Svenska etiketter som dashboarden visar per kategori. */
export const CATEGORY_LABELS: Record<Category, string> = {
  fact: "Faktum",
  decision: "Beslut",
  goal: "Mål",
  deadline: "Deadline",
  preference: "Preferens",
};

/** Minne som returneras till klienten. Innehåller aldrig user_id. */
export interface Memory {
  id: string;
  project: string;
  category: Category;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Rad som ligger i lagringen. Utöver klientfälten finns user_id (ägare) och
 * ett internt `seq` som ger stabil "senast uppdaterat först"-ordning även när
 * två rader delar samma sekundupplösta updated_at.
 */
export interface StoredMemory extends Memory {
  user_id: string;
  seq: number;
}

/** Fält som Claude/anroparen skickar in vid spara/uppdatera. */
export interface MemoryInput {
  project: string;
  category: string;
  title: string;
  content: string;
}

/** Indata till uppdatering: samma som MemoryInput plus id. */
export interface UpdateMemoryInput extends MemoryInput {
  id: string;
}

/** Indata till sökning. Alla fält valfria. */
export interface SearchInput {
  project?: string;
  category?: string;
  query?: string;
  offset?: number;
}

export type ErrorCode =
  | "INVALID_PROJECT"
  | "INVALID_TITLE"
  | "INVALID_CONTENT"
  | "INVALID_CATEGORY"
  | "INVALID_ID"
  | "INVALID_OFFSET"
  | "NOT_FOUND"
  | "INVALID_CREDENTIALS";

export interface MemoryError {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export type MemoryResult = Memory | MemoryError;
export type SearchResult = Memory[] | MemoryError;

/** Type guard: är resultatet ett felobjekt? */
export function isMemoryError(value: unknown): value is MemoryError {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as MemoryError).error?.code === "string"
  );
}
