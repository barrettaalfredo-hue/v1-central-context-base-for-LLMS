# Branch: `filip/dashboard`

**Ägare:** Filip  
**Bas:** `main`  
**Jobba här tills V1-dashboarden är klar.** Pusha fritt — krocka inte med Alfredos eller Melkers grenar.

Det här är **inte** minnesmotorn och **inte** den riktiga backend-en. Det är det visuella kontrollrummet plus en **låtsasbackend** så Filip kan bygga klart utan att vänta.

## Syfte

En enkel V1-dashboard där användaren ser inloggning, anslutningar, minnen och konflikter. Claude Desktop och ChatGPT Desktop syns som anslutningar (status), inte som något Filip implementerar i desktop-apparna.

## Tech stack (bara här)

- Next.js
- React
- TypeScript
- Tailwind
- Vercel

## Vad som ska finnas i den här branchen

Skapa och äg allt under dashboard-ytan, till exempel:

```
apps/dashboard/          # Next.js-appen
  app/ eller src/        # sidor och routing
  components/            # UI
  lib/mock-api/          # simulerad backend (Filips eget)
```

**Vyer (måste med i V1):**

1. **Inloggning** — login/logout, inloggningsstatus.
2. **Anslutningar** — Claude Desktop och ChatGPT Desktop: ansluten / frånkopplad / fel.
3. **Minnen** — lista minnen sorterade på ämne och tid (enkel sortering). Visa exempelminnen från mock-API:t.
4. **Konflikter** — visa motsägande minnen som behöver granskas (kan vara mockad data).

**Simulerad backend (obligatorisk tills Alfredo är klar):**

- Exempelminnen
- Inloggningsstatus
- Liveuppdateringar (t.ex. att ett nytt minne dyker upp utan reload)
- Felsituationer (auth-fel, anslutning nere, tom lista)

Mock-svaret ska **likna** den form Alfredo dokumenterar (minne, anslutning, konflikt, användare), så dashboarden senare bara byter bas-URL / klient — inte alla vyer.

## Vad som inte ska ligga här

- FastAPI, MCP, OAuth mot riktiga providers
- Databas, RLS, kö
- Extraktion, dubbletter, arkivering, kontextpaket
- Melkers worker eller Scaleway

## Arbeta självständigt med

En simulerad backend som ger exempelminnen, inloggningsstatus, liveuppdateringar och fel.

## Leverans till `integration/v1`

En **fungerande dashboard** där testanslutningen (mock) kan bytas mot Alfredos riktiga anslutning utan att bygga om vyerna.

## Klart-kriterium för den här branchen

- Inloggning, anslutningar, minnen och konflikter går att klicka igenom
- Mock-API täcker lyckat läge + fel
- README i `apps/dashboard/` förklarar hur man startar lokalt och på Vercel
- Inga beroenden till Melkers eller Alfredos körande tjänster
