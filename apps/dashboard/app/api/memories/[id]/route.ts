// MOCK. PATCH /api/memories/:id -> uppdaterat minne, eller error-objekt.
import { mockDb } from "@/lib/mock/db";
import { currentAccount, jsonError, jsonOk } from "@/lib/mock/session";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const account = await currentAccount();
  if (!account) return jsonError("UNAUTHENTICATED", "Inte inloggad.", 401);

  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Ogiltig JSON.", 400);
  }

  const result = mockDb.updateMemory(account.id, {
    id,
    project: String(body.project ?? ""),
    category: String(body.category ?? ""),
    title: String(body.title ?? ""),
    content: String(body.content ?? ""),
  });

  if ("error" in result) {
    const status =
      result.error.code === "NOT_FOUND" ? 404 : result.error.code.startsWith("INVALID_") ? 400 : 500;
    return jsonError(result.error.code, result.error.message, status);
  }
  return jsonOk(result.data);
}
