import { pkceChallenge } from "@/lib/oauth/crypto";
import { consumeCode } from "@/lib/oauth/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const json = form ? null : await request.json().catch(() => null);
  const params = form
    ? Object.fromEntries(form.entries())
    : ((json ?? {}) as Record<string, string>);

  const grant = String(params.grant_type ?? "");
  if (grant !== "authorization_code") {
    return Response.json({ error: "unsupported_grant_type" }, { status: 400 });
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
    return Response.json({ error: "invalid_grant" }, { status: 400 });
  }

  return Response.json(
    {
      access_token: row.access_token,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: row.refresh_token,
      scope: "memory",
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
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
