import { registerClient } from "@/lib/oauth/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { redirect_uris?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const redirectUris = Array.isArray(body.redirect_uris)
    ? body.redirect_uris.filter((value): value is string => typeof value === "string")
    : [];
  if (redirectUris.length === 0) {
    return Response.json({ error: "invalid_client_metadata" }, { status: 400 });
  }

  const client = await registerClient(redirectUris);
  return Response.json(
    {
      client_id: client.client_id,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: client.redirect_uris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    {
      status: 201,
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
