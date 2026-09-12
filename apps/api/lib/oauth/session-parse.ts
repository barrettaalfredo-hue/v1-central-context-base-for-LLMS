export type McpSession = {
  user_id: string;
  supabase_access: string;
  supabase_refresh: string;
};

export type ReusedMcpTokens = McpSession & {
  access_token: string;
  refresh_token: string;
};

function unwrapRecord(data: unknown): Record<string, unknown> | null {
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
  for (const key of ["oauth_reuse_session", "result", "data"] as const) {
    if (row[key] != null) {
      const nested = unwrapRecord(row[key]);
      if (nested) return nested;
    }
  }
  return row;
}

export function asMcpSession(data: unknown): McpSession | null {
  const row = unwrapRecord(data);
  if (!row) return null;
  const user_id = String(row.user_id ?? "");
  const supabase_access = String(row.supabase_access ?? "");
  const supabase_refresh = String(row.supabase_refresh ?? "");
  if (!user_id || !supabase_access || !supabase_refresh) return null;
  return { user_id, supabase_access, supabase_refresh };
}

export function asReusedMcpTokens(data: unknown): ReusedMcpTokens | null {
  const row = unwrapRecord(data);
  if (!row) return null;
  const session = asMcpSession(row);
  const access_token = String(row.access_token ?? "");
  const refresh_token = String(row.refresh_token ?? "");
  if (!session || !access_token || !refresh_token) return null;
  return { ...session, access_token, refresh_token };
}
