// MOCK. I måndagsläget (API_BASE_URL satt) går /api/auth/session till Alfredo i stället.
import { currentAccount, jsonOk } from "@/lib/mock/session";
import { proxyToUpstream } from "@/lib/upstream";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const up = await proxyToUpstream(request, "/api/auth/session");
  if (up) return up;

  const account = await currentAccount();
  if (!account) return jsonOk({ data: null });
  return jsonOk({ data: { id: account.id, email: account.email } });
}
