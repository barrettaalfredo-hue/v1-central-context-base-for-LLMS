"use client";

import { useEffect, useState } from "react";

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

export default function TestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<Session>(null);
  const [output, setOutput] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);

  async function refreshSession() {
    const result = await api("/api/auth/session");
    setSession(result.body.data ?? null);
  }

  useEffect(() => {
    void refreshSession();
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setPassword("");
    setOutput(JSON.stringify(result.body, null, 2));
    await refreshSession();
  }

  async function logout() {
    const result = await api("/api/auth/logout", { method: "POST" });
    setOutput(JSON.stringify(result.body, null, 2));
    setMemories([]);
    await refreshSession();
  }

  async function saveFixture() {
    const result = await api("/api/memories", {
      method: "POST",
      body: JSON.stringify({
        project: "Projekt A",
        category: "deadline",
        title: "Lanseringsdatum",
        content: "Vi lanserar 15 oktober 2026.",
      }),
    });
    setOutput(JSON.stringify(result.body, null, 2));
  }

  async function search() {
    const result = await api("/api/memories?project=Projekt%20A");
    setOutput(JSON.stringify(result.body, null, 2));
    if (Array.isArray(result.body)) setMemories(result.body);
  }

  async function updateFirst() {
    const first = memories[0];
    if (!first) {
      setOutput("Sök först så du har ett id.");
      return;
    }
    const result = await api(`/api/memories/${first.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        project: first.project,
        category: first.category,
        title: first.title,
        content: "Vi lanserar 22 oktober 2026.",
      }),
    });
    setOutput(JSON.stringify(result.body, null, 2));
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Alfredo — API-test</h1>
        <p className="text-sm text-neutral-500">
          Inte dashboarden. Logga in med ett förskapat konto, spara testdeadline,
          sök, uppdatera.
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
        <button className="rounded border px-3 py-2" type="button" onClick={saveFixture}>
          Spara Lanseringsdatum
        </button>
        <button className="rounded border px-3 py-2" type="button" onClick={search}>
          Sök Projekt A
        </button>
        <button className="rounded border px-3 py-2" type="button" onClick={updateFirst}>
          Uppdatera till 22 oktober
        </button>
      </div>

      <pre className="overflow-auto rounded bg-neutral-100 p-3 text-xs dark:bg-neutral-900">
        {output || "Svar visas här. Inget innehåll loggas på servern."}
      </pre>
    </main>
  );
}
