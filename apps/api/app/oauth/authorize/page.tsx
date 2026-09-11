import { getClient, redirectAllowed } from "@/lib/oauth/store";
import { approveMcpAccess } from "./actions";

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
  const errorCode = String(params.error ?? "");
  const errorText =
    errorCode === "credentials"
      ? "Fel mejl eller lösenord."
      : errorCode
        ? "Kunde inte godkänna åtkomst."
        : "";

  const client = clientId ? await getClient(clientId) : null;
  const ok = client && redirectAllowed(client, redirectUri) && method === "S256" && codeChallenge;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Godkänn Claude-minne</h1>
      <p className="text-sm text-neutral-600">
        Tillfällig OAuth-vy (Alfredo). Filip byter ut utseendet senare. Logga in med ett
        förskapat konto. Claude får då spara och hämta <strong>dina</strong> minnen.
      </p>
      {!ok ? (
        <p className="rounded border border-red-300 p-3 text-sm">
          Ogiltig OAuth-begäran. Öppna adressen från Claude Desktop, inte direkt.
        </p>
      ) : (
        <form className="flex flex-col gap-2" action={approveMcpAccess}>
          {errorText ? (
            <p className="rounded border border-red-300 p-3 text-sm">{errorText}</p>
          ) : null}
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="redirect_uri" value={redirectUri} />
          <input type="hidden" name="state" value={state} />
          <input type="hidden" name="code_challenge" value={codeChallenge} />
          <input type="hidden" name="code_challenge_method" value={method} />
          <input
            className="rounded border px-3 py-2"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="e-post"
            required
          />
          <input
            className="rounded border px-3 py-2"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="lösenord"
            required
          />
          <button className="rounded bg-black px-3 py-2 text-white" type="submit">
            Logga in och godkänn
          </button>
        </form>
      )}
    </main>
  );
}
