// MOCK. I måndagsläget (API_BASE_URL satt) går /api/auth/logout till Alfredo i stället.
import { clearSessionCookie, jsonOk } from "@/lib/mock/session";
import { proxyToUpstream } from "@/lib/upstream";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const up = await proxyToUpstream(request, "/api/auth/logout");
  if (up) return up;

  return clearSessionCookie(jsonOk({ data: { success: true } }));
}
