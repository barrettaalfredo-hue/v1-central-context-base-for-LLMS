// MOCK. I måndagsläget (API_BASE_URL satt) går /api/auth/login till Alfredo i stället.
import { findAccount } from "@/lib/mock/accounts";
import { jsonError, jsonOk, setSessionCookie } from "@/lib/mock/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("INVALID_BODY", "Ogiltig JSON.", 400);
  }

  const account = findAccount(body.email ?? "", body.password ?? "");
  if (!account) {
    return jsonError("INVALID_CREDENTIALS", "Fel mejl eller lösenord.", 401);
  }

  return setSessionCookie(jsonOk({ data: { id: account.id, email: account.email } }), account.id);
}
