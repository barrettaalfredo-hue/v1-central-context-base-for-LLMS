# `apps/dashboard/` — Filips leverans

**Person:** Filip  
**Branch:** `filip/dashboard`  
**Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, deploy på **Vercel** (region `arn1`, Stockholm)  
**Kontrakt:** [docs/contracts.md](../../docs/contracts.md). Inget eget minnesformat.

## Kör lokalt

```bash
cd apps/dashboard
npm install
npm run dev        # http://localhost:3000
npm test           # 9 kontraktstester mot mock-lagringen
npm run build      # samma build som Vercel kör
```

Utan miljövariabler startar dashboarden i **fristående mock-läge**. Logga in med
`filip@example.com`, `alfredo@example.com` eller `melker@example.com` och lösenordet
`mock-losen` (kan bytas med `MOCK_PASSWORD`). Varje mock-konto har de tre exempelminnena
från [docs/testexempel.md](../../docs/testexempel.md) med olika `id`, så isoleringen syns.

Mock-lagringen lever i serverprocessen och nollställs vid omstart. Det är avsiktligt.

## Två lägen, samma kod

| Läge | `API_BASE_URL` | Vad händer med `/api/*` |
| --- | --- | --- |
| Fristående (mock) | tom | Dashboardens egna route handlers under `app/api/` svarar. |
| Måndag (riktigt) | `https://<alfredos-preview>.vercel.app` | `next.config.ts` skriver om alla `/api/*` till Alfredos API på servern. Webbläsaren ser samma origin, så cookien från Supabase sätts på dashboardens domän och följer med. Ingen CORS. |

Vyerna anropar bara `lib/api.ts`. Bytet mock → riktigt är en miljövariabel, ingen kodändring.

`NEXT_PUBLIC_MCP_URL` visas i anslutningsguiden. Sätt till Alfredos `/api/mcp`.

## Vad som finns

| Sida | Väg | Beteende |
| --- | --- | --- |
| Inloggning | `/` | `POST /api/auth/login`. Fel lösen visar `Fel mejl eller lösenord.` med koden. Redan inloggad skickas till `/dashboard`. |
| Minneslista | `/dashboard` | `GET /api/memories?project=&category=&query=&offset=`. Ren JSON-lista. Svenska etiketter. Senast uppdaterat först. Auto-hämtning var 10:e sekund när fliken är synlig, pausar när den är dold, plus Uppdatera-knapp. Sida 50 med Föregående/Nästa. Tom lista är ett giltigt läge. `UNAUTHENTICATED` skickar till inloggning. |
| Anslutningsguide | `/anslut` | Fyra steg, kopieringsknappar för MCP-adress och instruktionstexten (exakt från `docs/claude-instruktioner.md`). |
| OAuth-godkännande | `/oauth/authorize` | Samma fältnamn och action som Alfredos sida. Slutlägen: ansluten, nekad, feltext. Mock-`/oauth/approve` verifierar mot mock-kontona. |
| Utloggning | knapp i toppraden | `POST /api/auth/logout` → `{ data: { success: true } }` → tillbaka till `/`. |

Fel visas alltid som text. Ett `error`-svar visas aldrig som lyckat.

## Till Alfredo: OAuth-vyn

Utseendet ligger i `components/OAuthApproveView.tsx`, en ren serverkomponent utan hooks.
Kopiera filen till `apps/api/components/` och rendera den från `apps/api/app/oauth/authorize/page.tsx`
med samma värden som idag (`valid`, `clientId`, `redirectUri`, `state`, `codeChallenge`,
`codeChallengeMethod`, `email`, `errorText`). Formuläret postar till `/oauth/approve` med exakt
samma fältnamn som nu.

Ett tillägg: knappen **Neka** skickar `decision=deny`. Ditt `/oauth/approve` måste antingen
hantera det (redirect till `redirect_uri` med `error=access_denied`) eller så tar vi bort knappen
vid porten. Säg till vilket.

Tailwind-tokens (`bg-accent`, `bg-panel`, `text-danger` osv.) definieras i `app/globals.css`.
Kopiera `:root`-blocket dit också, annars blir vyn ostylad.

## Klart på grenen

- [x] Inloggning, felinloggning och utloggning följer JSON-kontraktet
- [x] Lista, sök, filter och 10-sekunders-refresh fungerar mot mock
- [x] Anslutningsguide + OAuth-vy går att klicka igenom
- [x] Svenska kategorietiketter stämmer
- [x] README förklarar `npm run dev` / Vercel
- [x] Ingen kod beror på att Alfredos eller Melkers tjänster körs

## Vercel

Nytt Vercel-projekt med **Root Directory `apps/dashboard`**. `vercel.json` sätter region `arn1`.
Miljövariabler: `API_BASE_URL` och `NEXT_PUBLIC_MCP_URL` (preview och production).

## Måndag 14/9

Grenen mergas till **`integration/v1`** efter Alfredo och Melker. Inte direkt till `main`.
Sätt `API_BASE_URL` till previewen från `integration/v1` och kör listan i
[docs/torsdag-test.md](../../docs/torsdag-test.md).

Otestat till dess: att Supabases `Set-Cookie` via rewriten fungerar i Vercel-preview. Det är
standardbeteende för Next-rewrites men har inte verifierats mot Alfredos preview härifrån.
Om cookien inte fastnar är fallback att lägga dashboarden som sidor i `apps/api` (samma origin).
