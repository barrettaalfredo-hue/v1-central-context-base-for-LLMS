import { pkceChallenge } from "@/lib/oauth/crypto";
import { consumeCode } from "@/lib/oauth/store";
import { accessTokenExpiresIn } from "@/lib/oauth/tokens";
import { createSupabaseAnonClient } from "@/lib/supabase/clients";

export const dynamic = "force-dynamic";

const TOKEN_HEADERS = {
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
};

function tokenJson(accessToken: string, refreshToken: string | null) {
  return Response.json(
    {
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: accessTokenExpiresIn(accessToken),
      refresh_token: refreshToken,
      scope: "memory",
    },
    { headers: TOKEN_HEADERS },
  );
}

async function readParams(request: Request) {
  const form = await request.formData().catch(() => null);
  if (form) return Object.fromEntries(form.entries()) as Record<string, string>;
  const json = await request.json().catch(() => null);
  return (json ?? {}) as Record<string, string>;
}

export async function POST(request: Request) {
  const params = await readParams(request);
  const grant = String(params.grant_type ?? "");

  if (grant === "refresh_token") {
    const refreshToken = String(params.refresh_token ?? "");
    if (!refreshToken) {
      return Response.json({ error: "invalid_request" }, { status: 400, headers: TOKEN_HEADERS });
    }
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session?.access_token) {
      return Response.json({ error: "invalid_grant" }, { status: 400, headers: TOKEN_HEADERS });
    }
    return tokenJson(data.session.access_token, data.session.refresh_token);
  }

  if (grant !== "authorization_code") {
    return Response.json({ error: "unsupported_grant_type" }, { status: 400, headers: TOKEN_HEADERS });
  }

  const code = String(params.code ?? "");
  const redirectUri = String(params.redirect_uri ?? "");
  const clientId = String(params.client_id ?? "");
  const verifier = String(params.code_verifier ?? "");
  const row = await consumeCode(code);

  if (
    !row ||
    row.client_id !== clientId ||
    row.redirect_uri !== redirectUri ||
    pkceChallenge(verifier) !== row.code_challenge
  ) {
    return Response.json({ error: "invalid_grant" }, { status: 400, headers: TOKEN_HEADERS });
  }

  return tokenJson(row.access_token, row.refresh_token);
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version",
    },
  });
}
