export type McpSession = {
  user_id: string;
  supabase_access: string;
  supabase_refresh: string;
};

export function asMcpSession(data: unknown): McpSession | null {
  let value: unknown = data;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (Array.isArray(value)) value = value[0];
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const user_id = String(row.user_id ?? "");
  const supabase_access = String(row.supabase_access ?? "");
  const supabase_refresh = String(row.supabase_refresh ?? "");
  if (!user_id || !supabase_access || !supabase_refresh) return null;
  return { user_id, supabase_access, supabase_refresh };
}
