import type { ErrorCode, MemoryError } from "./types.js";

/**
 * Svenska felmeddelanden per kod. NOT_FOUND-texten avslöjar aldrig om ett id
 * existerar eller tillhör ett annat konto (samma svar i båda fallen).
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_PROJECT: "Projektnamnet måste vara 1–100 tecken.",
  INVALID_TITLE: "Titeln måste vara 1–150 tecken.",
  INVALID_CONTENT: "Innehållet måste vara 1–10 000 tecken.",
  INVALID_CATEGORY:
    "Kategorin måste vara en av fact, decision, goal, deadline eller preference.",
  INVALID_ID: "Ogiltigt id.",
  INVALID_OFFSET: "Offset måste vara ett heltal som är 0 eller större.",
  NOT_FOUND: "Minnet hittades inte.",
  INVALID_CREDENTIALS: "Fel mejl eller lösenord.",
};

export function makeError(code: ErrorCode): MemoryError {
  return { error: { code, message: ERROR_MESSAGES[code] } };
}
