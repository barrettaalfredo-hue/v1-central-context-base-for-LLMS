import { jsonOk } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return jsonOk({ data: null });
  }

  return jsonOk({
    data: { id: data.user.id, email: data.user.email },
  });
}
