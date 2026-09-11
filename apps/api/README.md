# `apps/api/` — Alfredos leverans

**Person:** Alfredo  
**Branch:** `alfredo/integrations`  
**Stack:** Next.js **serverfunktioner** + **MCP SDK/adapter** på **Vercel**; **Supabase** PostgreSQL + Auth/OAuth  
**Region:** Supabase **Stockholm (`eu-north-1`)**, Vercel-backend **Stockholm (`arn1`)**  
**Supabase:** projekt `uthkzkvpkkpzrmzjunqq` är skapat. Konton, signup-lås och Vercel-env: [docs/supabase-setup.md](../../docs/supabase-setup.md).  
**Arbetar självständigt med:** förutbestämda minnessvar (exakt JSON från [docs/testexempel.md](../../docs/testexempel.md)) medan du bygger riktig Auth, databasåtkomst och MCP.

Torsdag anropar du Melkers funktioner i `packages/memory/` i stället för förutbestämda svar. MCP-ytan ska då vara oförändrad.

## Hur du kör (den här mappen)

I Vercel: **Root Directory = `apps/api`**. Region `arn1` står i `vercel.json`. Env-namn: [docs/supabase-setup.md](../../docs/supabase-setup.md).

```bash
cd apps/api
cp .env.example .env.local   # fyll anon-nyckeln, inte service_role
npm install
npm test
npm run dev
```

Öppna `/` — det är **Alfredos testyta**, inte Filips dashboard. Logga in med ett förskapat konto, spara Lanseringsdatum, sök, logga in som konto 2 och kontrollera att listan är tom.

| Metod | Sökväg | Kontrakt |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ email, password }` → `data` eller `INVALID_CREDENTIALS` |
| GET | `/api/auth/session` | `data` eller `null` |
| POST | `/api/auth/logout` | `{ data: { success: true } }` |
| POST | `/api/memories` och `/api/mcp/save_memory` | `save_memory` |
| GET | `/api/memories` och POST `/api/mcp/search_memory` | `search_memory` |
| PATCH | `/api/memories/:id` och POST `/api/mcp/update_memory` | `update_memory` |
| GET | `/api/health` | env satta, ingen hemlighet |

Claude-OAuth för fjärr-MCP kommer i nästa steg på samma gren. HTTP-JSON ovan är samma tre verktyg.

## Du måste leverera (annars är backend/MCP inte klar)

### 1. Tre förskapade konton

- E-post + lösenord i Supabase Auth.
- Ingen publik registreringsendpoint.
- Lösenord **inte** i git. Dokumentera bara hur teamet loggar in (t.ex. delad lösenordshanterare).

### 2. Inloggning mot dashboarden

Samma JSON som [docs/contracts.md](../../docs/contracts.md):

- in: `{ email, password }`
- ut inloggad / null / utloggning / `INVALID_CREDENTIALS`

Session ska fungera från **olika datorer** (test 2 på torsdag).

### 3. Databas

- Tabell för minnen med: `id`, `user_id`, `project`, `category`, `title`, `content`, `created_at`, `updated_at`.
- RLS: raden tillhör `user_id` för inloggad användare.
- Konto A kan inte `SELECT`/`UPDATE` Konto B även med känt `id`.
- Privat innehåll: **ingen publik CDN-cache**, **ingen loggning** av `content`/lösenord.

### 4. Fjärr-MCP på Vercel

Tre verktyg, inga fler:

| Verktyg | In |
| --- | --- |
| `save_memory` | `project`, `category`, `title`, `content` |
| `search_memory` | `project?`, `category?`, `query?`, `offset?` |
| `update_memory` | `id`, `project`, `category`, `title`, `content` |

- Ägare = OAuth/inloggning, **aldrig** ett user-id Claude skickar.
- `save_memory` sätter `id` (UUID), `created_at`, `updated_at`.
- `search_memory`: textsök i title/content, filter, `updated_at` desc.
- `update_memory`: 404/forbidden om fel konto eller saknas; annars samma `id` och ny `updated_at`.
- Fel: `{ "error": { "code", "message" } }`. **Aldrig** ett minnesobjekt när det misslyckades.

Tills Melker är inkopplad: returnera förutbestämda svar som **bit för bit** matchar testexemplet (så Filip kan sikta på samma form).

### 5. OAuth för MCP

- Supabase OAuth så Claude fjärr-MCP kan identifiera samma användare som dashboarden.
- Filips OAuth-vy är UI; du levererar det som vyn ska anropa.
- Dokumentera MCP-URL:en som ska stå i anslutningsguiden.

### 6. Anrop till minneslogik

- Efter integration: **samma** TypeScript-funktioner som Melker äger (`packages/memory`), både från dashboard-serverfunktioner och från MCP.
- Innan dess: en intern stub med förutbestämda minnen, samma funktionsnamn om möjligt så bytet blir litet.

## Du ska inte bygga

- Python, worker, kö, Cron, vektordatabas, ChatGPT-adapter.
- Dashboard-UI (förutom att API:t matar Filips kontrakt).
- Minnesregler (validering/söklogik) som **annan** form än Melkers — en hjärna.
- Lokal MCP-process som användaren ska installera.

## Klart på din gren när

- [x] Tre konton finns; inloggnings-JSON stämmer
- [ ] RLS-test: Konto B ser inte Konto A (görs mot preview efter Root Directory `apps/api`)
- [x] MCP `save_memory` / `search_memory` / `update_memory` svarar enligt kontraktet (HTTP-JSON mot riktig DB; Claude-OAuth kvar)
- [ ] MCP-URL + OAuth-flöde går att genomföra mot Claude Desktop (eller dokumenterat med screenshot/steg om Desktop strular)
- [x] Stockholm-region är satt; ingen publik cache av minnen
- [x] Felvägar returnerar `error`, aldrig fejk-lycka

Torsdag mergas den här grenen **först** in i **`integration/v1`**. Inte direkt till `main`.
