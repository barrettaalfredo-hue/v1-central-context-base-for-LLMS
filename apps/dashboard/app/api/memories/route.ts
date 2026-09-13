// MOCK. Samma svarsform som Alfredos apps/api/app/api/memories/route.ts:
//   GET  -> ren JSON-lista (inte { data: [...] })
//   POST -> minnesobjekt, 201
//   ej inloggad -> { error: { code: "UNAUTHENTICATED" } }, 401
import { mockDb } from "@/lib/mock/db";
import { currentAccount, jsonError, jsonOk } from "@/lib/mock/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const account = await currentAccount();
  if (!account) return jsonError("UNAUTHENTICATED", "Inte inloggad.", 401);

  const url = new URL(request.url);
  const offsetRaw = url.searchParams.get("offset");
  const result = mockDb.searchMemory(account.id, {
    project: url.searchParams.get("project") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    query: url.searchParams.get("query") ?? undefined,
    offset: offsetRaw == null || offsetRaw === "" ? 0 : Number(offsetRaw),
  });

  if ("error" in result) return jsonError(result.error.code, result.error.message, 400);
  return jsonOk(result.data);
}

export async function POST(request: Request) {
  const account = await currentAccount();
  if (!account) return jsonError("UNAUTHENTICATED", "Inte inloggad.", 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Ogiltig JSON.", 400);
  }

  const result = mockDb.saveMemory(account.id, {
    project: String(body.project ?? ""),
    category: String(body.category ?? ""),
    title: String(body.title ?? ""),
    content: String(body.content ?? ""),
  });

  if ("error" in result) {
    const status = result.error.code.startsWith("INVALID_") ? 400 : 500;
    return jsonError(result.error.code, result.error.message, status);
  }
  return jsonOk(result.data, 201);
}
