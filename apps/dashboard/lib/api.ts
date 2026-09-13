/**
 * Klientanrop mot /api. Samma kod i mock-läge och mot Alfredos API,
 * eftersom rewriten i next.config.ts avgör vart /api går.
 *
 * Regler:
 *  - credentials: "include" så sessionscookien följer med.
 *  - Nätverksfel och trasig JSON blir ett felobjekt, aldrig ett undantag i UI:t.
 *  - GET /api/memories returnerar en ren lista, INTE { data: [...] }.
 */
import type {
  ApiError,
  LoginResponse,
  LogoutResponse,
  Memory,
  SearchInput,
  SessionResponse,
} from "./types";
import { isApiError } from "./types";

const NETWORK_ERROR: ApiError = {
  error: { code: "NETWORK_ERROR", message: "Kunde inte nå servern. Kontrollera anslutningen." },
};

async function request<T>(input: string, init?: RequestInit): Promise<T | ApiError> {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    return NETWORK_ERROR;
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      error: {
        code: "INVALID_RESPONSE",
        message: `Servern svarade ${response.status} utan giltig JSON.`,
      },
    };
  }

  if (isApiError(body)) return body;
  if (!response.ok) {
    return {
      error: { code: `HTTP_${response.status}`, message: `Servern svarade ${response.status}.` },
    };
  }
  return body as T;
}

export function login(email: string, password: string) {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<LogoutResponse>("/api/auth/logout", { method: "POST" });
}

export function session() {
  return request<SessionResponse>("/api/auth/session");
}

export function searchMemories(params: SearchInput) {
  const search = new URLSearchParams();
  if (params.project) search.set("project", params.project);
  if (params.category) search.set("category", params.category);
  if (params.query) search.set("query", params.query);
  if (params.offset) search.set("offset", String(params.offset));
  const qs = search.toString();
  return request<Memory[]>(`/api/memories${qs ? `?${qs}` : ""}`);
}
