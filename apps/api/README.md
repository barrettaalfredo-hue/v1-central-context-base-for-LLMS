# `apps/api/` — Alfredos leverans

**Person:** Alfredo  
**Branch:** `alfredo/integrations`  
**Stack:** Next.js **serverfunktioner** + **MCP SDK/adapter** på **Vercel**; **Supabase** PostgreSQL + Auth/OAuth  
**Region:** Supabase **Stockholm**, Vercel-backend **Stockholm**  
**Arbetar självständigt med:** förutbestämda minnessvar (exakt JSON från [docs/testexempel.md](../../docs/testexempel.md)) medan du bygger riktig Auth, databasåtkomst och MCP.

Torsdag anropar du Melkers funktioner i `packages/memory/` i stället för förutbestämda svar. MCP-ytan ska då vara oförändrad.

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

- [ ] Tre konton finns; inloggnings-JSON stämmer
- [ ] RLS-test: Konto B ser inte Konto A
- [ ] MCP `save_memory` / `search_memory` / `update_memory` svarar enligt kontraktet (stub eller riktig DB)
- [ ] MCP-URL + OAuth-flöde går att genomföra mot Claude Desktop (eller dokumenterat med screenshot/steg om Desktop strular)
- [ ] Stockholm-region är satt; ingen publik cache av minnen
- [ ] Felvägar returnerar `error`, aldrig fejk-lycka

Torsdag mergas den här grenen **först** in i **`integration/v1`**. Inte direkt till `main`.
