import { jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonOk({
    ok: true,
    region: "arn1",
    supabaseUrlSet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKeySet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  });
}
