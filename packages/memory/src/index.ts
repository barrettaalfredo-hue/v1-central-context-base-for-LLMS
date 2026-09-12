/**
 * @v1/memory — hjärnan.
 *
 * Delade TypeScript-minnesfunktioner som både dashboard-API och MCP importerar
 * efter ihopkoppling. Samma regler, samma sökbeteende, ingen duplicerad logik.
 *
 * Kontrakt: docs/contracts.md. Testexempel: docs/testexempel.md.
 */

export {
  validateMemoryInput,
  validateSearchInput,
  cleanQuery,
} from "./validation.js";
export { validateMemoryId } from "./validation.js";

export {
  saveMemory,
  searchMemory,
  updateMemory,
  createMemoryStore,
  MemoryStore,
  defaultStore,
  PAGE_SIZE,
} from "./store.js";
export type { MemoryStoreOptions } from "./store.js";

export {
  CATEGORIES,
  CATEGORY_LABELS,
  isMemoryError,
} from "./types.js";
export type {
  Category,
  Memory,
  StoredMemory,
  MemoryInput,
  UpdateMemoryInput,
  SearchInput,
  ErrorCode,
  MemoryError,
  MemoryResult,
  SearchResult,
} from "./types.js";

export { ERROR_MESSAGES, makeError } from "./errors.js";
export { formatTimestamp } from "./time.js";
