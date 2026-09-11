import { createSupabaseAdminClient } from "@/lib/supabase/clients";

export type OAuthClient = {
  client_id: string;
  redirect_uris: string[];
};

export async function registerClient(redirectUris: string[]) {
  const admin = createSupabaseAdminClient();
  const client_id = crypto.randomUUID();
  const { error } = await admin.schema("private").from("oauth_clients").insert({
    client_id,
    redirect_uris: redirectUris,
    token_endpoint_auth_method: "none",
  });
  if (error) throw error;
  return { client_id, redirect_uris: redirectUris };
}

export async function getClient(clientId: string): Promise<OAuthClient | null> {
  if (clientId.startsWith("https://")) {
    try {
      const response = await fetch(clientId, {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) return null;
      const body = (await response.json()) as {
        client_id?: string;
        redirect_uris?: string[];
      };
      const uris = body.redirect_uris ?? [];
      if (!Array.isArray(uris) || uris.length === 0) return null;
      return { client_id: clientId, redirect_uris: uris };
    } catch {
      return null;
    }
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema("private")
    .from("oauth_clients")
    .select("client_id, redirect_uris")
    .eq("client_id", clientId)
    .maybeSingle();
  return data as OAuthClient | null;
}

export function redirectAllowed(client: OAuthClient, redirectUri: string) {
  return client.redirect_uris.includes(redirectUri);
}

export async function saveCode(row: {
  code: string;
  client_id: string;
  redirect_uri: string;
  code_challenge: string;
  access_token: string;
  refresh_token: string | null;
  user_id: string;
}) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.schema("private").from("oauth_codes").insert({
    ...row,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  if (error) throw error;
}

export async function consumeCode(code: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .schema("private")
    .from("oauth_codes")
    .select(
      "code, client_id, redirect_uri, code_challenge, access_token, refresh_token, user_id, expires_at",
    )
    .eq("code", code)
    .maybeSingle();

  if (!data) return null;
  await admin.schema("private").from("oauth_codes").delete().eq("code", code);
  if (new Date(data.expires_at as string).getTime() < Date.now()) return null;
  return data as {
    code: string;
    client_id: string;
    redirect_uri: string;
    code_challenge: string;
    access_token: string;
    refresh_token: string | null;
    user_id: string;
    expires_at: string;
  };
}
