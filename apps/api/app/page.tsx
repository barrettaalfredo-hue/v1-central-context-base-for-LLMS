"use client";

import { useCallback, useEffect, useState } from "react";

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

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
}

export default function TestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session>(null);
  const [output, setOutput] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadError, setLoadError] = useState("");

  async function refreshSession() {
    const result = await api("/api/auth/session");
    setSession(result.body.data ?? null);
    return (result.body.data ?? null) as Session;
  }

  const loadMemories = useCallback(async () => {
    const result = await api("/api/memories");
    if (!result.ok) {
      setLoadError(result.body?.error?.message ?? "Kunde inte hämta minnen.");
      setMemories([]);
      setOutput(JSON.stringify(result.body, null, 2));
      return;
    }
    const list = asMemoryList(result.body);
    setMemories(list);
    setLoadError("");
    setOutput(JSON.stringify(result.body, null, 2));
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
    }, 10_000);
    return () => window.clearInterval(timer);
  }, [session, loadMemories]);

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
    await refreshSession();
  }

  const latest = memories[0];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Alfredo — API-test</h1>
        <p className="text-sm text-neutral-500">
          Inte dashboarden. Logga in med samma konto som Claude. Minnen hämtas
          automatiskt var 10:e sekund.
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

      {loadError ? (
        <p className="rounded border border-red-300 p-3 text-sm">{loadError}</p>
      ) : null}

      {latest ? (
        <section className="rounded border-2 border-black p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Senast uppdaterat minne</p>
          <h2 className="mt-1 text-xl font-semibold">{latest.title}</h2>
          <p className="text-sm text-neutral-600">
            {latest.project} · {latest.category}
          </p>
          <p className="mt-3 text-lg">{latest.content}</p>
          <p className="mt-2 text-xs text-neutral-500">
            uppdaterat {formatTime(latest.updated_at)}
          </p>
        </section>
      ) : session ? (
        <p className="rounded border p-3 text-sm">Inga minnen för det här kontot ännu.</p>
      ) : (
        <p className="rounded border p-3 text-sm">Logga in för att se minnen Claude sparat.</p>
      )}

      {memories.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {memories.map((memory) => (
            <li key={memory.id} className="rounded border p-3">
              <p className="font-medium">{memory.title}</p>
              <p className="text-sm text-neutral-600">
                {memory.project} · {memory.category}
              </p>
              <p className="mt-1">{memory.content}</p>
              <p className="mt-1 text-xs text-neutral-500">
                uppdaterat {formatTime(memory.updated_at)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <pre className="overflow-auto rounded bg-neutral-100 p-3 text-xs dark:bg-neutral-900">
        {output || "Råsvar visas här. Inget innehåll loggas på servern."}
      </pre>
    </main>
  );
}
