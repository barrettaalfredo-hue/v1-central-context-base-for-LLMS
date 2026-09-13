// MOCK. I måndagsläget (API_BASE_URL satt) går /api/auth/logout till Alfredo i stället.
import { clearSessionCookie, jsonOk } from "@/lib/mock/session";

export const dynamic = "force-dynamic";

export async function POST() {
  return clearSessionCookie(jsonOk({ data: { success: true } }));
}
