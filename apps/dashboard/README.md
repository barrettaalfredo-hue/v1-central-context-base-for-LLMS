# `apps/dashboard/` — Filips leverans

**Person:** Filip  
**Branch:** `filip/dashboard`  
**Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, deploy på **Vercel** (region `arn1`, Stockholm)  
**Kontrakt:** [docs/contracts.md](../../docs/contracts.md). Inget eget minnesformat.

## Kör lokalt

```bash
cd apps/dashboard
npm install --include=dev   # --include=dev krävs om NODE_ENV=production är satt globalt (Filips dator)
npm run dev        # http://localhost:3000
npm test           # 11 tester: kontrakt mot mock-lagringen + instruktionstext mot docs
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
| Fristående (mock) | tom | Route-filerna under `app/api/` svarar själva med mock-lagringen. |
| Måndag (riktigt) | `https://<preview för integration/v1>` | Samma route-filer skickar anropet vidare till Alfredos API via `lib/upstream.ts`. Webbläsaren ser bara dashboardens origin, så Supabases `Set-Cookie` sätts på dashboardens domän och följer med i nästa anrop. Ingen CORS behövs (Alfredos API har ingen). |

Vyerna anropar bara `lib/api.ts`. Bytet mock → riktigt är en miljövariabel, ingen kodändring.

Proxyn är testad end-to-end lokalt med två instanser (en som spelar Alfredos API): login-cookie
sätts via proxyn, session/lista/PATCH/logout går igenom, felobjekt passerar oförändrade.
Upstream nere ger `UPSTREAM_UNREACHABLE` (502). Upstream som svarar HTML (t.ex. Vercels
inloggningssida vid Deployment Protection) ger `UPSTREAM_NOT_JSON` (502) med tydlig text.

`VERCEL_PROTECTION_BYPASS`: om Alfredos preview är skyddad, sätt hemligheten från hans
Vercel-projekt här. Proxyn skickar den som `x-vercel-protection-bypass`.

`NEXT_PUBLIC_MCP_URL` visas i anslutningsguiden. Tomt = `API_BASE_URL` + `/api/mcp`, så den
pekar automatiskt på samma preview som API:t.

## Kompatibilitet med Alfredo och Melker (kontrollerat 13/9 mot deras grenar)

| Krav | Källa | Dashboard |
| --- | --- | --- |
| `GET /api/memories` är en ren lista, inte `{ data }` | Alfredo `jsonOk(result.data)`, Melkers överlämning | `lib/api.ts` läser listan direkt |
| Login/session ger `{ data: { id, email } }` eller `{ data: null }` | Alfredo `auth/*` | `useSession`, login-sidan |
| 401 `UNAUTHENTICATED` när sessionen dött | Alfredo `requireUser()` | Skickar till inloggning |
| PATCH `/api/memories/:id`, 404 `NOT_FOUND` med låst text | Alfredo `[id]/route.ts` | Mock speglar exakt |
| Kategorier gemener mot API, svenska etiketter i UI | contracts.md | `CATEGORY_LABELS` |
| Instruktionstexten byte-lik `docs/claude-instruktioner.md` (nya blocket, inte enradaren) | torsdag-test 13 och 16 | `test/instructions.test.ts` faller vid drift |
| Tom lista visas som tom, inte mock-rader (test 8, 15) | torsdag-test | Mock används aldrig när `API_BASE_URL` är satt |
| Same origin, `credentials: "include"` | filip-auth.md | Proxy i `lib/upstream.ts` |
| OAuth-vyn: samma fältnamn/action som Alfredos sida | Alfredo `oauth/authorize/page.tsx` | `components/OAuthApproveView.tsx` |

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
Miljövariabler: `API_BASE_URL`, ev. `VERCEL_PROTECTION_BYPASS`, ev. `NEXT_PUBLIC_MCP_URL`.

## Måndag 14/9

Grenen mergas till **`integration/v1`** efter Alfredo och Melker. Inte direkt till `main`.
Sätt `API_BASE_URL` till previewen från `integration/v1` och kör listan i
[docs/torsdag-test.md](../../docs/torsdag-test.md).

Verifierat 13/9 från Filips dator mot Alfredos preview (`alfredo/integrations`), med
`API_BASE_URL` satt och Filips testkonto: fel lösen → `INVALID_CREDENTIALS`; login sätter
Supabases riktiga cookie `sb-…-auth-token` på dashboardens origin via proxyn; session, ren
lista, POST (201), identisk omsparning (samma `id` och `updated_at`), sök `query=typescript`,
`category=Beslut` → `INVALID_CATEGORY`, `project=Projekt a` → `[]`, PATCH samma `id`,
PATCH påhittat `id` → 404 `NOT_FOUND` med låst text. I webbläsaren: inloggning, lista med
svenska etiketter och samma `id`, ny rad synlig inom 10 s utan klick, anslutningsguiden med
härledd MCP-adress.

Återstår för test 14-16: samma sak mot previewen för **`integration/v1`** (efter merge), och
Claude via MCP i stället för curl.
