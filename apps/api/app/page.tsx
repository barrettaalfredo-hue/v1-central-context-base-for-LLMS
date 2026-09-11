"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Session = { id: string; email: string } | null;
type Memory = {
  id: string;
  project: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  const body = await response.json();
  return { ok: response.ok, status: response.status, body };
}

function asMemoryList(body: unknown): Memory[] {
  if (Array.isArray(body)) return body as Memory[];
  if (body && typeof body === "object" && Array.isArray((body as { data?: unknown }).data)) {
    return (body as { data: Memory[] }).data;
  }
  return [];
}

function sortByUpdated(list: Memory[]) {
  return [...list].sort(
    (a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at) || a.id.localeCompare(b.id),
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
}

function formatRelative(value: string, now: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diff = now - date.getTime();
  if (diff < 15_000) return "just nu";
  if (diff < 60_000) return `för ${Math.max(1, Math.floor(diff / 1000))} sekunder sedan`;
  if (diff < 3_600_000) return `för ${Math.max(1, Math.floor(diff / 60_000))} minuter sedan`;
  if (diff < 86_400_000) return `för ${Math.max(1, Math.floor(diff / 3_600_000))} timmar sedan`;
  return formatTime(value);
}

function isFresh(value: string, now: number) {
  return now - new Date(value).getTime() < 15 * 60 * 1000;
}

export default function TestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session>(null);
  const [output, setOutput] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadError, setLoadError] = useState("");
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [flashKey, setFlashKey] = useState("");
  const previousLatest = useRef("");

  async function refreshSession() {
    const result = await api("/api/auth/session");
    setSession(result.body.data ?? null);
    return (result.body.data ?? null) as Session;
  }

  const loadMemories = useCallback(async () => {
    const result = await api("/api/memories");
    setFetchedAt(Date.now());
    if (!result.ok) {
      setLoadError(result.body?.error?.message ?? "Kunde inte hämta minnen.");
      setMemories([]);
      setOutput(JSON.stringify(result.body, null, 2));
      return;
    }
    const list = sortByUpdated(asMemoryList(result.body));
    setMemories(list);
    setLoadError("");
    setOutput(JSON.stringify(result.body, null, 2));

    const latest = list[0];
    if (!latest) return;
    const key = `${latest.id}:${latest.updated_at}:${latest.content}`;
    if (previousLatest.current && previousLatest.current !== key) {
      setFlashKey(key);
    }
    previousLatest.current = key;
  }, []);

  useEffect(() => {
    void (async () => {
      const current = await refreshSession();
      if (current) await loadMemories();
    })();
  }, [loadMemories]);

  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => {
      void loadMemories();
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [session, loadMemories]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setPassword("");
    setOutput(JSON.stringify(result.body, null, 2));
    const current = await refreshSession();
    if (current) await loadMemories();
  }

  async function logout() {
    const result = await api("/api/auth/logout", { method: "POST" });
    setOutput(JSON.stringify(result.body, null, 2));
    setMemories([]);
    setLoadError("");
    setFetchedAt(null);
    previousLatest.current = "";
    await refreshSession();
  }

  const latest = memories[0];
  const latestKey = latest ? `${latest.id}:${latest.updated_at}:${latest.content}` : "";
  const latestIsNew = Boolean(latest && flashKey === latestKey);
  const latestIsFresh = Boolean(latest && isFresh(latest.updated_at, now));

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Alfredo — API-test</h1>
        <p className="text-sm text-neutral-500">
          Inte Filips dashboard. Logga in med <strong>samma konto som Claude</strong>.
          Listan hämtas var 5:e sekund. Det senast ändrade minnet ligger överst i det
          gula kortet.
        </p>
      </div>

      <p>
        Session:{" "}
        {session ? (
          <strong>{session.email}</strong>
        ) : (
          <span>inte inloggad</span>
        )}
      </p>

      <form className="flex flex-col gap-2" onSubmit={login}>
        <input
          className="rounded border px-3 py-2"
          type="email"
          autoComplete="username"
          placeholder="e-post"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="rounded border px-3 py-2"
          type="password"
          autoComplete="current-password"
          placeholder="lösenord"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button className="rounded bg-black px-3 py-2 text-white" type="submit">
          Logga in
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button className="rounded border px-3 py-2" type="button" onClick={logout}>
          Logga ut
        </button>
        <button className="rounded border px-3 py-2" type="button" onClick={() => void loadMemories()}>
          Uppdatera lista
        </button>
      </div>

      {session && fetchedAt ? (
        <p className="text-xs text-neutral-500">
          {memories.length} minnen · hämtat {formatRelative(new Date(fetchedAt).toISOString(), now)}
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      {latest ? (
        <section
          className={`rounded-lg border-2 p-5 ${
            latestIsFresh
              ? "border-amber-500 bg-amber-100 text-black"
              : "border-black bg-amber-50 text-black"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              Senast uppdaterat minne
            </p>
            {latestIsFresh ? (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
                {latestIsNew ? "ÄNDRAD NU" : "UPPDATERAT"}
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 text-2xl font-bold">{latest.title}</h2>
          <p className="text-sm text-neutral-700">
            {latest.project} · {latest.category}
          </p>
          <p className="mt-4 text-2xl leading-snug font-semibold">{latest.content}</p>
          <p className="mt-3 text-sm font-medium text-amber-900">
            uppdaterat {formatRelative(latest.updated_at, now)}
            <span className="ml-2 font-normal text-neutral-600">
              ({formatTime(latest.updated_at)})
            </span>
          </p>
        </section>
      ) : session ? (
        <p className="rounded border p-3 text-sm">Inga minnen för det här kontot ännu.</p>
      ) : (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-black">
          Logga in med samma e-post som Claude för att se minnen här. Placeholder-adressen
          alfredo.test@example.com har inga rader.
        </p>
      )}

      {memories.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {memories.map((memory) => {
            const fresh = isFresh(memory.updated_at, now);
            return (
              <li
                key={memory.id}
                className={`rounded border p-3 ${
                  memory.id === latest?.id ? "border-amber-500 bg-amber-50 text-black" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{memory.title}</p>
                  {fresh ? (
                    <span className="shrink-0 text-xs font-semibold text-amber-800">
                      {formatRelative(memory.updated_at, now)}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-neutral-600">
                  {memory.project} · {memory.category}
                </p>
                <p className="mt-1 text-lg">{memory.content}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  uppdaterat {formatTime(memory.updated_at)}
                </p>
              </li>
            );
          })}
        </ul>
      ) : null}

      <details className="rounded border p-3 text-xs">
        <summary className="cursor-pointer">Råsvar från API</summary>
        <pre className="mt-2 overflow-auto rounded bg-neutral-100 p-3 dark:bg-neutral-900">
          {output || "Inget innehåll loggas på servern."}
        </pre>
      </details>
    </main>
  );
}
