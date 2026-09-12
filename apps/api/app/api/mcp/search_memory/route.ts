import { createMemoryApi, createSupabaseStore } from "@v1/memory";
import { jsonError, jsonOk } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return jsonError("UNAUTHENTICATED", "Inte inloggad.", 401);
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return jsonError("INVALID_BODY", "Ogiltig JSON.", 400);
  }

  const api = createMemoryApi(createSupabaseStore(supabase));
  const result = await api.searchMemory(data.user.id, {
    project: body.project == null ? undefined : String(body.project),
    category: body.category == null ? undefined : String(body.category),
    query: body.query == null ? undefined : String(body.query),
    offset: body.offset == null ? 0 : Number(body.offset),
  });

  if ("error" in result) {
    return jsonError(result.error.code, result.error.message, 400);
  }
  return jsonOk(result.data);
}
