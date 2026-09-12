# v1-central-context-base-for-LLMS

Privat molnminne för **Claude Desktop**. Claude väljer vad som ska sparas och hämtas enligt fasta instruktioner. Systemet lagrar och lämnar tillbaka minnen. Varje konto ser bara sitt eget minne.

**V1-mål:** allt ihopkopplat och testat **torsdag 17 september 2026**.

TypeScript överallt. Två molntjänster: **Vercel** och **Supabase**. Ingen Python, ingen separat AI-modell, ingen worker, ingen kö, ingen Cron, ingen vektordatabas.

---

## Läge 12 september 2026 — gren `alfredo/integrations`

Alfredos del på den här grenen är klar för V1. Det här är **inte** Filips dashboard. Melker byter in `packages/memory` på torsdag. Inte mergea till `main`.

**MCP (koppla en gång):** `https://v1-central-context-bas-git-7f4021-barrettaalfredo-hues-projects.vercel.app/api/mcp`  
Inte `https://v1-central-context-base-for-llms.vercel.app` (tom `main` → 404). Inte `…-ko0vrc092` eller `…-bb720p5c9`. Klick: [docs/oauth-mcp-alfredos-steg.md](docs/oauth-mcp-alfredos-steg.md). Sidan `/` är Alfredos testsida.

### Klart

- Login, session, logout mot Supabase i Stockholm.
- Save / search / update av minnen. Ägare = inloggning. Konto A ser inte konto B.
- Fjärr-MCP + OAuth. Claude Desktop har sparat, sökt och uppdaterat på riktigt.
- Testsida `/` visar nya och ändrade minnen live (gult kort).
- MCP stängs inte av efter tid. Refresh ger tillbaka samma tokens. Koppla en gång.

### Vad som funkar

| Anrop | Funkar |
| --- | --- |
| `POST /api/auth/login` med `{ "email", "password" }` | Ja. Fel lösen → `INVALID_CREDENTIALS` |
| `GET /api/auth/session` | Ja. Inloggad `{ data: { id, email } }` eller `{ data: null }` |
| `POST /api/auth/logout` | Ja. `{ data: { success: true } }` |
| `POST /api/memories` / Claude `save_memory` | Ja. Skriver i Stockholm. Ägare = inloggning |
| `GET /api/memories` / Claude `search_memory` | Ja. Filter + textsök, `updated_at` desc |
| `PATCH /api/memories/:id` / Claude `update_memory` | Ja. 404 om saknas eller annat konto |
| Claude Desktop → `/api/mcp` + OAuth | Ja, mot preview. Koppla en gång. Inte production |

Konton ligger i lösenordshanteraren, inte i git. Env-namn: [docs/supabase-setup.md](docs/supabase-setup.md). Filip: [docs/filip-auth.md](docs/filip-auth.md).

### Inte klart här

- Filips Next.js-dashboard (`filip/dashboard`).
- Melkers `packages/memory` är inte inkopplat än (Alfredo har en fungerande kopia i `apps/api/lib/memory/`).
- Torsdag: den här grenen **först** in i `integration/v1`, sen Melker, sen Filip. Tester där, inte på `main`.

### SMS till teamet (kopiera)

Alfredo 12/9: login, Stockholm-DB, fjärr-MCP och OAuth är klara på `alfredo/integrations`. Claude sparar/söker/uppdaterar. Testsida `/` visar det live. A/B: Filip och Melker ser inte Alfredos rader. MCP dör inte efter tid — koppla en gång mot preview-URL:en i README. Inte main (404). Filip: dashboard mot samma JSON, koppla API torsdag. Melker: byt in `packages/memory` torsdag. Torsdag: Alfredo först in i `integration/v1`.

### PR:er som ligger inne

| PR | Vad |
| --- | --- |
| [#2](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/pull/2) | Login, session, logout, save/search/update mot Stockholm |
| [#3](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/pull/3) | Status i README |
| [#4](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/pull/4) | Fjärr-MCP `/api/mcp` + OAuth |
| [#5](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/pull/5) | OAuth följer preview-host. Publik anon-nyckel |
| [#6](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/pull/6) | `refresh_token` när Claude dog efter ~5 min |
| [#7](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/pull/7) | Stabil MCP-token. Testsida med gult kort |
| [#9](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/pull/9) | Live-lista (Realtime + poll) |
| [#10](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/pull/10) | A/B-isolering klar |
| [#11](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/pull/11) | MCP stängs inte av. Koppla en gång |

```
Claude Desktop  ↔  fjärr-MCP (Vercel)  ↔  minnesfunktioner (TypeScript)  ↔  Supabase
                                                      ↑
                                              Dashboarden läser samma minne
```

Ingen lokal minnesapp. Ingen lokal MCP-server. Användaren loggar in på dashboarden, kopierar MCP-adressen till Claudes fjärranslutningar, godkänner åtkomst och klistrar in instruktionerna i Claude-projektet.

---

## Inte i V1

ChatGPT, automatisk chattinsamling, filer, delade arbetsytor, avancerad sortering, minneshistorik, automatisk konflikthantering, offentlig registrering.

---

## Minimala features (måste finnas torsdag)

1. Claude Desktop kopplar med **MCP** till databasen, med **tydliga instruktioner**.
2. Minnesbasen kan **extrahera/spara information från chattar** (Claude anropar `save_memory` / `update_memory`).
3. Claude kan **hämta info från databasen via MCP** (`search_memory`).
4. Enkel **sortering**: filter på projekt/kategori + senast uppdaterat först.
5. Enkel **dashboard**: inloggning, minneslista, sökning, filter, anslutningsguide.

---

## Tech stack (exakt)

| Del | Teknik | Vad den gör | Ansvar | Branch |
| --- | --- | --- | --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind på **Vercel** | Inloggning, minneslista, sökning, filter, anslutningsguide. Filip äger även **OAuth-godkännandevyn**. | Filip | `filip/dashboard` |
| Backend och MCP | Next.js **serverfunktioner** + **MCP SDK/adapter** på **Vercel** | Tar emot Claudes verktygsanrop, kontrollerar behörighet, anropar minnesfunktionerna. | Alfredo | `alfredo/integrations` |
| Lagring och login | **Supabase** PostgreSQL + Auth/OAuth | Lagrar minnen. Identifierar användaren från olika datorer. Stockholm. | Alfredo | `alfredo/integrations` |
| Minneslogik | Vanliga **TypeScript-funktioner** (“hjärnan”) | Validerar kategori, sparar, uppdaterar, söker. **Samma funktioner** används av dashboard och MCP. | Melker | `melker/memory` |

Flöde vid uppdatering: Claude söker relevant minne, hämtar dess `id`, anropar `update_memory`. Ingen historik.

---

## Branches

Alla person-grenar utgår från **samma startpaket**. Gemensamma format ändras bara efter överenskommelse. **Ingen feature-kod direkt till `main`.** Torsdag mergas de tre delarna till `integration/v1`, testas där, och går till `main` **först när testerna är godkända**.

| Branch | Person | När den används | Måste leverera |
| --- | --- | --- | --- |
| [`filip/dashboard`](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/tree/filip/dashboard) | Filip | Dagligen tills dashboarden är klar mot mock | [apps/dashboard/README.md](apps/dashboard/README.md) |
| [`alfredo/integrations`](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/tree/alfredo/integrations) | Alfredo | Dagligen tills Auth, DB och fjärr-MCP är klara | [apps/api/README.md](apps/api/README.md) |
| [`melker/memory`](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/tree/melker/memory) | Melker | Dagligen tills hjärnan + instruktioner är klara | [packages/memory/README.md](packages/memory/README.md) |
| [`integration/v1`](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/tree/integration/v1) | Alla tre | **Torsdag 17/9 — ihopkoppling och test före `main`** | [docs/torsdag-test.md](docs/torsdag-test.md) + [docs/integration-v1.md](docs/integration-v1.md) |

```bash
git fetch origin
git checkout filip/dashboard         # Filip, daglig kod
git checkout alfredo/integrations    # Alfredo, daglig kod
git checkout melker/memory           # Melker, daglig kod
git checkout integration/v1          # bara vid ihopkoppling/test
```

```
filip/dashboard ────────┐
alfredo/integrations ───┼──► integration/v1 ──(tester godkända)──► main
melker/memory ──────────┘
```

---

## Låsta beslut (ändras inte utan att alla tre säger ja)

| Beslut | Exakt V1-regel |
| --- | --- |
| Konton | Tre **förskapade** konton med e-post och lösenord. **Ingen** offentlig registrering. |
| Åtkomst | Varje konto ser **bara sina egna** minnen. Ägaren = inloggningen, **aldrig** Claude. Konto A får inte se eller uppdatera Konto B:s minnen även om ID:t är känt. |
| Minnesformat | `id`, `project`, `category`, `title`, `content`, `created_at`, `updated_at`. Databasen lagrar även `user_id`. |
| Kategorier | Endast `fact`, `decision`, `goal`, `deadline`, `preference`. **Svenska etiketter** i dashboarden. |
| Projekt | Ett textnamn, t.ex. `"Projekt A"`. Ingen separat projekttabell. |
| Sökning | Textsökning i titel/innehåll, filter på projekt/kategori, **senast uppdaterat först**. |
| Uppdatering | Befintligt minne ändras med dess `id`. Ingen historik, ingen automatisk konflikthantering. |
| Dashboard | Läsning, sökning, filter. Uppdatera **var 10:e sekund** när sidan är aktiv, plus uppdateringsknapp. |
| Region | Supabase **Stockholm**. Vercel-backend **Stockholm**. Privat innehåll får **inte** cachas publikt eller loggas. |

Detta garanterar inte EU-lagring hos Claude.

Fullständiga JSON-fält, inloggningsformat och exempel: [docs/contracts.md](docs/contracts.md).

---

## Claude: MCP-verktyg och instruktioner

Tre verktyg, inga fler i V1:

| Verktyg | Argument | Vad som ska hända |
| --- | --- | --- |
| `save_memory` | `project`, `category`, `title`, `content` | Skapar minne åt **inloggad** användare. Backend sätter `id`, `created_at`, `updated_at`, `user_id`. |
| `search_memory` | `project?`, `category?`, `query?`, `offset?` | Söker i **inloggad** användares minnen. Senast uppdaterat först. |
| `update_memory` | `id`, `project`, `category`, `title`, `content` | Uppdaterar befintligt minne **om det tillhör inloggad användare**. Sätter `updated_at`. |

Instruktionerna som ska klistras in i Claude-projektet (exakt text): [docs/claude-instruktioner.md](docs/claude-instruktioner.md).

Det är **instruktionstyrt** beteende, ingen garanti att Claude alltid anropar verktygen. Användaren ska inte behöva skriva “hämta från minnet”; instruktionen säger åt Claude att göra det.

Användarflöde: logga in på dashboarden → kopiera MCP-adressen → Claude fjärranslutning → logga in och godkänn → klistra in instruktionerna.

Detalj: [docs/claude-koppling.md](docs/claude-koppling.md).

---

## Torsdag 17/9 — testerna som måste klaras

Körs på **`integration/v1`**, inte på `main`. Hur ni mergar: [docs/integration-v1.md](docs/integration-v1.md).

Alla fyra, på riktigt, samma minne, samma konto:

1. Claude **sparar** ett minne som **syns i dashboarden**.
2. Samma konto **hämtar** minnet från **en annan dator** och en **ny Claude-chatt**.
3. **Sökning**, **uppdatering** och **återförsök** fungerar **utan identiska dubbletter**.
4. **Fel visas tydligt.** Misslyckad sparning rapporteras **aldrig** som lyckad.

Gemensamma testdata: [docs/testexempel.md](docs/testexempel.md). Checklista: [docs/torsdag-test.md](docs/torsdag-test.md).

---

## Kodmappar i startpaketet

| Mapp | Gren som fyller den | Innehåll |
| --- | --- | --- |
| `apps/dashboard/` | `filip/dashboard` | Next.js-appen |
| `apps/api/` | `alfredo/integrations` | Next.js serverfunktioner + MCP |
| `packages/memory/` | `melker/memory` | Delade TypeScript-minnesfunktioner |

Varje mapp har egen README med **exakt leverans**. Läs den innan du kodar i mappen.
