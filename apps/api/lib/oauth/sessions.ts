import { randomToken } from "@/lib/oauth/crypto";
import { accessTokenExpiresIn } from "@/lib/oauth/tokens";
import { createSupabaseAnonClient } from "@/lib/supabase/clients";

export const MCP_ACCESS_SECONDS = 8 * 60 * 60;
export const MCP_REFRESH_SECONDS = 30 * 24 * 60 * 60;

export type McpSession = {
  user_id: string;
  supabase_access: string;
  supabase_refresh: string;
};

const supabaseRefreshInflight = new Map<string, Promise<{ access: string; refresh: string } | null>>();
const mcpRefreshInflight = new Map<string, Promise<IssuedTokens | null>>();

export type IssuedTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  supabase_access: string;
};

function expiresAt(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export async function issueMcpTokens(input: {
  userId: string;
  supabaseAccess: string;
  supabaseRefresh: string;
}): Promise<IssuedTokens> {
  const access_token = randomToken();
  const refresh_token = randomToken();
  const supabase = createSupabaseAnonClient();
  const { error } = await supabase.rpc("oauth_create_session", {
    p_access: access_token,
    p_refresh: refresh_token,
    p_user_id: input.userId,
    p_supabase_access: input.supabaseAccess,
    p_supabase_refresh: input.supabaseRefresh,
    p_access_expires: expiresAt(MCP_ACCESS_SECONDS),
    p_refresh_expires: expiresAt(MCP_REFRESH_SECONDS),
  });
  if (error) throw error;
  return {
    access_token,
    refresh_token,
    expires_in: MCP_ACCESS_SECONDS,
    supabase_access: input.supabaseAccess,
  };
}

export async function getMcpSession(accessToken: string): Promise<McpSession | null> {
  const supabase = createSupabaseAnonClient();
  const { data, error } = await supabase.rpc("oauth_get_session", { p_access: accessToken });
  if (error || !data || typeof data !== "object") return null;
  const row = data as McpSession;
  if (!row.user_id || !row.supabase_access || !row.supabase_refresh) return null;
  return row;
}

async function refreshSupabase(userId: string, refreshToken: string) {
  const existing = supabaseRefreshInflight.get(userId);
  if (existing) return existing;
  const pending = (async () => {
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session?.access_token || !data.session.refresh_token) return null;
    return { access: data.session.access_token, refresh: data.session.refresh_token };
  })().finally(() => {
    supabaseRefreshInflight.delete(userId);
  });
  supabaseRefreshInflight.set(userId, pending);
  return pending;
}

export async function supabaseAccessForMcp(accessToken: string, session: McpSession) {
  if (accessTokenExpiresIn(session.supabase_access, 0) > 90) {
    return session.supabase_access;
  }
  const refreshed = await refreshSupabase(session.user_id, session.supabase_refresh);
  if (!refreshed) return session.supabase_access;
  const supabase = createSupabaseAnonClient();
  await supabase.rpc("oauth_update_supabase_tokens", {
    p_access: accessToken,
    p_supabase_access: refreshed.access,
    p_supabase_refresh: refreshed.refresh,
  });
  return refreshed.access;
}

export async function rotateMcpRefresh(refreshToken: string): Promise<IssuedTokens | null> {
  const existing = mcpRefreshInflight.get(refreshToken);
  if (existing) return existing;
  const pending = (async () => {
    const access_token = randomToken();
    const newRefresh = randomToken();
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.rpc("oauth_rotate_session", {
      p_refresh: refreshToken,
      p_new_access: access_token,
      p_new_refresh: newRefresh,
      p_access_expires: expiresAt(MCP_ACCESS_SECONDS),
      p_refresh_expires: expiresAt(MCP_REFRESH_SECONDS),
    });
    if (!error && data && typeof data === "object") {
      const row = data as McpSession;
      return {
        access_token,
        refresh_token: newRefresh,
        expires_in: MCP_ACCESS_SECONDS,
        supabase_access: row.supabase_access,
      };
    }

    const upgraded = await refreshSupabase(`legacy:${refreshToken.slice(0, 12)}`, refreshToken);
    if (!upgraded) return null;
    const userClient = createSupabaseAnonClient();
    const { data: userData } = await userClient.auth.getUser(upgraded.access);
    if (!userData.user) return null;
    return issueMcpTokens({
      userId: userData.user.id,
      supabaseAccess: upgraded.access,
      supabaseRefresh: upgraded.refresh,
    });
  })().finally(() => {
    mcpRefreshInflight.delete(refreshToken);
  });
  mcpRefreshInflight.set(refreshToken, pending);
  return pending;
}
