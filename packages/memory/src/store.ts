import { randomUUID } from "node:crypto";
import { makeError } from "./errors.js";
import { defaultNow, formatTimestamp } from "./time.js";
import {
  type Memory,
  type MemoryError,
  type MemoryInput,
  type MemoryResult,
  type SearchInput,
  type SearchResult,
  type StoredMemory,
  type UpdateMemoryInput,
  isMemoryError,
} from "./types.js";
import {
  validateMemoryId,
  validateMemoryInput,
  validateSearchInput,
} from "./validation.js";

/** Högst så här många minnen per sökanrop (kontrakt). */
export const PAGE_SIZE = 50;

export interface MemoryStoreOptions {
  /** Klocka. Injiceras i tester för deterministiska tidsstämplar. */
  now?: () => Date;
  /** Id-generator. Injiceras i tester för förutsägbara id:n. */
  idFactory?: () => string;
}

/** Klientvy: ta bort user_id och det interna seq-fältet. */
function toClient(row: StoredMemory): Memory {
  const { user_id: _user_id, seq: _seq, ...memory } = row;
  return memory;
}

/**
 * Simulerad lagring med samma form och beteende som den riktiga Supabase-
 * lagringen ska ha. Både dashboard-API och MCP kan importera exakt de här
 * funktionerna – ingen duplicerad söklogik.
 */
export class MemoryStore {
  private rows: StoredMemory[] = [];
  private seqCounter = 0;
  private readonly now: () => Date;
  private readonly idFactory: () => string;

  constructor(options: MemoryStoreOptions = {}) {
    this.now = options.now ?? defaultNow;
    this.idFactory = options.idFactory ?? (() => randomUUID());
  }

  /** Nollställ lagringen (praktiskt mellan tester). */
  reset(): void {
    this.rows = [];
    this.seqCounter = 0;
  }

  validateMemoryInput(input: MemoryInput) {
    return validateMemoryInput(input);
  }

  validateSearchInput(input: SearchInput) {
    return validateSearchInput(input);
  }

  validateMemoryId(id: unknown) {
    return validateMemoryId(id);
  }

  /**
   * Skapar ett minne för `user_id`. Identisk omsparning (samma konto plus
   * samma project, category, title, content) skapar ingen ny rad – då
   * returneras befintlig rad som lyckat svar med oförändrat id och updated_at.
   */
  saveMemory(user_id: string, input: MemoryInput): MemoryResult {
    const validated = validateMemoryInput(input);
    if (isMemoryError(validated)) return validated;

    const existing = this.rows.find(
      (row) =>
        row.user_id === user_id &&
        row.project === validated.project &&
        row.category === validated.category &&
        row.title === validated.title &&
        row.content === validated.content,
    );
    if (existing) {
      return toClient(existing);
    }

    const timestamp = formatTimestamp(this.now());
    const row: StoredMemory = {
      id: this.idFactory(),
      user_id,
      project: validated.project,
      category: validated.category,
      title: validated.title,
      content: validated.content,
      created_at: timestamp,
      updated_at: timestamp,
      seq: ++this.seqCounter,
    };
    this.rows.push(row);
    return toClient(row);
  }

  /**
   * Uppdaterar en befintlig rad via id, men bara om den tillhör `user_id`.
   * Saknad rad och rad som tillhör annat konto ger samma NOT_FOUND-fel så att
   * felet inte avslöjar om ett id existerar.
   */
  updateMemory(user_id: string, input: UpdateMemoryInput): MemoryResult {
    const idCheck = validateMemoryId(input.id);
    if (isMemoryError(idCheck)) return idCheck;

    const validated = validateMemoryInput(input);
    if (isMemoryError(validated)) return validated;

    const row = this.rows.find(
      (candidate) => candidate.id === input.id && candidate.user_id === user_id,
    );
    if (!row) {
      return makeError("NOT_FOUND");
    }

    row.project = validated.project;
    row.category = validated.category;
    row.title = validated.title;
    row.content = validated.content;
    row.updated_at = formatTimestamp(this.now());
    row.seq = ++this.seqCounter;

    return toClient(row);
  }

  /**
   * Söker i `user_id`:s minnen. Sortering: updated_at fallande (senast
   * uppdaterat först), med internt seq som tiebreaker. Högst PAGE_SIZE per
   * anrop; `offset` hoppar över rader i samma sortering.
   */
  searchMemory(user_id: string, input: SearchInput = {}): SearchResult {
    const validated = validateSearchInput(input);
    if (isMemoryError(validated)) return validated;

    const { project, category, query, offset } = validated;

    const matches = this.rows
      .filter((row) => row.user_id === user_id)
      .filter((row) => (project === undefined ? true : row.project === project))
      .filter((row) =>
        category === undefined ? true : row.category === category,
      )
      .filter((row) => {
        if (query === undefined) return true;
        return (
          row.title.toLowerCase().includes(query) ||
          row.content.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (a.updated_at !== b.updated_at) {
          return a.updated_at < b.updated_at ? 1 : -1;
        }
        return b.seq - a.seq;
      });

    return matches.slice(offset, offset + PAGE_SIZE).map(toClient);
  }
}

/** Standardlagring som de exporterade funktionerna använder. */
export const defaultStore = new MemoryStore();

export function saveMemory(
  user_id: string,
  input: MemoryInput,
): MemoryResult {
  return defaultStore.saveMemory(user_id, input);
}

export function updateMemory(
  user_id: string,
  input: UpdateMemoryInput,
): MemoryResult {
  return defaultStore.updateMemory(user_id, input);
}

export function searchMemory(
  user_id: string,
  input: SearchInput = {},
): SearchResult {
  return defaultStore.searchMemory(user_id, input);
}

/** Skapa en isolerad lagring (för tester eller för att koppla in Supabase). */
export function createMemoryStore(options?: MemoryStoreOptions): MemoryStore {
  return new MemoryStore(options);
}

export type { MemoryError };
