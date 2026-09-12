import { makeError } from "./errors.js";
import {
  CATEGORIES,
  type Category,
  type MemoryError,
  type MemoryInput,
  type SearchInput,
} from "./types.js";

export interface NormalizedMemoryInput {
  project: string;
  category: Category;
  title: string;
  content: string;
}

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/**
 * Validerar och normaliserar (trimmar) spara/uppdatera-indata.
 *
 * Fälten trimmas före kontroll och det trimmade värdet är det som sparas.
 * Vid flera ogiltiga fält returneras ett enda fel i ordningen
 * project, title, content, category.
 */
export function validateMemoryInput(
  input: MemoryInput,
): NormalizedMemoryInput | MemoryError {
  const project = (input.project ?? "").trim();
  const title = (input.title ?? "").trim();
  const content = (input.content ?? "").trim();
  const category = (input.category ?? "").trim();

  if (project.length < 1 || project.length > 100) {
    return makeError("INVALID_PROJECT");
  }
  if (title.length < 1 || title.length > 150) {
    return makeError("INVALID_TITLE");
  }
  if (content.length < 1 || content.length > 10_000) {
    return makeError("INVALID_CONTENT");
  }
  if (!isCategory(category)) {
    return makeError("INVALID_CATEGORY");
  }

  return { project, category, title, content };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validerar att `id` är ett UUID. */
export function validateMemoryId(id: unknown): { id: string } | MemoryError {
  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return makeError("INVALID_ID");
  }
  return { id };
}

export interface NormalizedSearchInput {
  project?: string;
  category?: string;
  /** Rensad, gemener-normaliserad delsträng. Undefined = inget textfilter. */
  query?: string;
  offset: number;
}

/**
 * Validerar sökindata. `offset` måste vara ett heltal >= 0.
 *
 * `query` städas: tecknen % _ , ( ) tas bort, resultatet trimmas och görs till
 * gemener för skiftlägesokänslig delsträngssökning. Blir query tomt efter
 * städning används inget textfilter.
 */
export function validateSearchInput(
  input: SearchInput,
): NormalizedSearchInput | MemoryError {
  const offset = input.offset ?? 0;
  if (!Number.isInteger(offset) || offset < 0) {
    return makeError("INVALID_OFFSET");
  }

  const cleanedQuery = cleanQuery(input.query);

  return {
    project: input.project,
    category: input.category,
    query: cleanedQuery,
    offset,
  };
}

/** Rensar och normaliserar en sökterm. Returnerar undefined om inget kvarstår. */
export function cleanQuery(query: string | undefined): string | undefined {
  if (typeof query !== "string") return undefined;
  const cleaned = query.replace(/[%_,()]/g, "").trim().toLowerCase();
  return cleaned.length > 0 ? cleaned : undefined;
}
