import { OAuthApproveView, OAUTH_ERROR_TEXT } from "@/components/OAuthApproveView";
import { getClient, redirectAllowed } from "@/lib/oauth/store";

export const dynamic = "force-dynamic";

export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const clientId = String(params.client_id ?? "");
  const redirectUri = String(params.redirect_uri ?? "");
  const state = String(params.state ?? "");
  const codeChallenge = String(params.code_challenge ?? "");
  const method = String(params.code_challenge_method ?? "S256");
  const email = String(params.email ?? "");
  const errorCode = String(params.error ?? "");
  const errorText =
    OAUTH_ERROR_TEXT[errorCode] ?? (errorCode ? "Kunde inte godkänna åtkomst." : "");

  const client = clientId ? await getClient(clientId) : null;
  const ok = Boolean(
    client && redirectAllowed(client, redirectUri) && method === "S256" && codeChallenge,
  );

  return (
    <OAuthApproveView
      valid={ok}
      clientId={clientId}
      redirectUri={redirectUri}
      state={state}
      codeChallenge={codeChallenge}
      codeChallengeMethod={method}
      email={email || undefined}
      errorText={errorText || undefined}
      action="/oauth/approve"
    />
  );
}
