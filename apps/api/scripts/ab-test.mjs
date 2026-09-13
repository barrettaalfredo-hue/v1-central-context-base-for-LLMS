#!/usr/bin/env node
/**
 * RLS A/B-test. Lösenord via env, aldrig i git.
 *
 *   ACCOUNT_A_EMAIL=... ACCOUNT_A_PASSWORD=... \
 *   ACCOUNT_B_EMAIL=... ACCOUNT_B_PASSWORD=... \
 *   BASE_URL=https://din-preview.vercel.app \
 *   node scripts/ab-test.mjs
 */
const base = process.env.BASE_URL;
const aEmail = process.env.ACCOUNT_A_EMAIL;
const aPassword = process.env.ACCOUNT_A_PASSWORD;
const bEmail = process.env.ACCOUNT_B_EMAIL;
const bPassword = process.env.ACCOUNT_B_PASSWORD;

if (!base || !aEmail || !aPassword || !bEmail || !bPassword) {
  console.error("Saknar BASE_URL eller konto-env.");
  process.exit(1);
}

function cookieHeader(response) {
  const raw =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean);
  const parts = raw.flatMap((value) =>
    String(value)
      .split(/,(?=\s*[^;]+=)/)
      .map((cookie) => cookie.split(";")[0].trim())
      .filter(Boolean),
  );
  return parts.join("; ");
}

function asRecord(body) {
  if (body && typeof body === "object" && body.data && typeof body.data === "object") {
    return body.data;
  }
  return body;
}

function asList(body) {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object" && Array.isArray(body.data)) return body.data;
  return [];
}

async function login(email, password) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();
  const cookie = cookieHeader(response);
  if (!response.ok || !cookie) {
    throw new Error(`Login misslyckades för ${email}: ${JSON.stringify(body)}`);
  }
  return cookie;
}

async function json(cookie, path, init = {}) {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      cookie,
      ...(init.headers ?? {}),
    },
  });
  return { status: response.status, body: await response.json() };
}

const cookieA = await login(aEmail, aPassword);
const cookieB = await login(bEmail, bPassword);

const saved = await json(cookieA, "/api/memories", {
  method: "POST",
  body: JSON.stringify({
    project: "Projekt A",
    category: "deadline",
    title: `A/B-test ${Date.now()}`,
    content: `A/B-test ${Date.now()}`,
  }),
});
const savedRow = asRecord(saved.body);
if (!savedRow?.id) {
  console.error("Konto A kunde inte spara", saved);
  process.exit(1);
}

const listB = await json(cookieB, "/api/memories");
if (asList(listB.body).some((row) => row.id === savedRow.id)) {
  console.error("FAIL: Konto B såg Konto A:s minne");
  process.exit(1);
}

const updateB = await json(cookieB, `/api/memories/${savedRow.id}`, {
  method: "PATCH",
  body: JSON.stringify({
    project: "Projekt A",
    category: "deadline",
    title: "Lanseringsdatum",
    content: "Konto B ska inte kunna detta",
  }),
});
const updated = asRecord(updateB.body);
if (updateB.status === 200 && updated?.id) {
  console.error("FAIL: Konto B uppdaterade Konto A:s minne");
  process.exit(1);
}

console.log("OK: Konto B ser inte och kan inte uppdatera Konto A:s minne.");
