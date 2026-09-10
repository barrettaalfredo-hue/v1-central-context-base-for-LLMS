# v1-central-context-base-for-LLMS

Centralt minnessystem för AI. Context från flera LLM:er samlas på ett ställe, sorteras efter relevans och tid, och skickas med som ett kort färdigt sammanhang **innan** modellen svarar.

`main` är skyddad utgångspunkt. Tre personer pushar oberoende av varandra. När delarna går att koppla ihop mergas de till `integration/v1`.

## Innan kod — gör detta tillsammans

Ingen skriver app-kod förrän Filip, Alfredo och Melker har gjort **samma workshop**. En halv dag. En skriver, två godkänner. Underlag: [`docs/claude-koppling.md`](docs/claude-koppling.md), [`docs/innan-kod.md`](docs/innan-kod.md) och [`docs/contracts.md`](docs/contracts.md).

**Börja med Claude-kopplingen** ([`docs/claude-koppling.md`](docs/claude-koppling.md)). Ni planerar inte tre produkter. Ni planerar två anrop (`save_conversation` och `get_context`) och ett JSON-paket. Det paketet **är** synken mellan er. Brancher hindrar bara fil-krockar — de synkar inte data.

Gör **exakt** detta, i den här ordningen:

0. **Lås Claude-kopplingen tillsammans (30–45 min).** Acceptera att Claude Desktop i V1 anropar `get_context`. Läs `docs/claude-koppling.md`. Fyll kontextpaket + råsamtal i kontraktet. Skriv ett gemensamt test: samma fråga, samma tre minnesrader, som Alfredo hårdkodar, Melker producerar, Filip visar.
1. **Välj injektion.** För V1: Claude anropar alltid `get_context` (det som Desktop faktiskt tillåter). En egen gateway framför Claude är ett senare projekt.
2. **Välj klient för V1.** Bevisa Claude Desktop först. ChatGPT Desktop bara om ni tillsammans bekräftat vad appen faktiskt stöder.
3. **Namnge saknad teknik.** Databas (t.ex. Postgres), kö, relevans i V1 (ämne+tid eller embeddings), extraktionsmodell, auth-provider.
4. **Fyll `docs/contracts.md` fält för fält.** Minne, konflikt, anslutning, råsamtal, kö, kontextpaket, RLS. Filip mockar filen. Melker speglar den. Alfredo implementerar den.
5. **Lås auth-gränsen.** Alfredo äger riktig inloggning. Filip mockar samma fält, bygger inte ett eget login-system.
6. **Skriv demo-scriptet** ni ska klara tillsammans: godkänt samtal in → DB+kö → extraherat minne → syns i dashboard → ny fråga får kort kontextpaket.
7. **Boka ihopkoppling i mitten av sprinten**, inte bara i slutet. Mergeordning: Alfredo → Melker → Filip.

**Stopp-regel:** tom ruta i `docs/innan-kod.md` = ingen Next.js, FastAPI eller worker ännu.

## Tech stack (exakt)

| Person | Branch | Tech stack |
| --- | --- | --- |
| Filip | `filip/dashboard` | Next.js, React, TypeScript, Tailwind, Vercel |
| Alfredo | `alfredo/integrations` | FastAPI, MCP, klientanslutningar, insamling, Auth/OAuth, databasstruktur, RLS, kö, backenddrift |
| Melker | `melker/memory-engine` | Python-worker, schemaläggning, Scaleway, extraktion, dubbletter, versionering, konflikter, arkivering, sökning, kontextpaket |
| Alla tre | `integration/v1` | Alla stackar ovan, ihopkopplade mot samma databas och kö |

Filip bygger också vyer för inloggning, anslutningar, minnen och konflikter, plus en simulerad backend. Alfredo bygger också en simulerad minnesmotor och ett testverktyg. Melker bygger mot samma specifikation som Alfredo (testdatabas och testkö).

## Branches

| Branch | Ägare | Roll |
| --- | --- | --- |
| [`filip/dashboard`](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/tree/filip/dashboard) | Filip | Dashboard + simulerad backend |
| [`alfredo/integrations`](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/tree/alfredo/integrations) | Alfredo | API, MCP, auth, DB, kö + minnes-stub |
| [`melker/memory-engine`](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/tree/melker/memory-engine) | Melker | Minnesmotor (extraktion, konflikter, kontextpaket) |
| [`integration/v1`](https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS/tree/integration/v1) | Alla tre | Ihopkoppling när de tre delarna är klara |

Checkout:

```bash
git fetch origin
git checkout filip/dashboard        # Filip
git checkout alfredo/integrations   # Alfredo
git checkout melker/memory-engine   # Melker
git checkout integration/v1         # bara vid ihopkoppling
```

Push bara till er egen gren. Lägg inte feature-kod på `main` eller `integration/v1` förrän det är dags att koppla ihop.

---

### `filip/dashboard`

**Tech stack:** Next.js, React, TypeScript, Tailwind, Vercel

**Vad branchen ska ha**

- Next.js-app med React, TypeScript och Tailwind, deploy på Vercel
- Vyer: **inloggning**, **anslutningar** (Claude Desktop / ChatGPT Desktop: ansluten, frånkopplad, fel), **minnen** (enkel sortering ämne + tid), **konflikter**
- Simulerad backend: exempelminnen, inloggningsstatus, liveuppdateringar, fel (auth nere, tom lista)
- Mock-API som speglar Alfredos fält (minne, anslutning, konflikt, användare) så vyerna senare bara byter anslutning

**Ska inte ha:** FastAPI, MCP, riktig databas, Melkers worker

**Leverans:** klickbar dashboard där mock kan bytas mot Alfredos API utan att bygga om vyerna

---

### `alfredo/integrations`

**Tech stack:** FastAPI, MCP, klientanslutningar, insamling, Auth/OAuth, databasstruktur, RLS, kö, backenddrift

**Vad branchen ska ha**

- FastAPI och MCP, klientanslutningar för Claude Desktop och ChatGPT Desktop
- Insamling av **godkända** samtal (modellen ska inte själv välja vad som sparas)
- Auth/OAuth, databasstruktur, RLS, kö och backenddrift
- Simulerad minnesmotor med förutbestämda svar
- Testverktyg som ersätter dashboarden (ingest, lista minnen, hämta kontextpaket, fel)
- Implementera `docs/contracts.md` (ifyllt **tillsammans innan kod**, se `docs/innan-kod.md`)
- `docs/desktop-support.md` — vad desktop-apparna faktiskt stöder

**Ska inte ha:** Next.js-dashboard, riktig extraktion/ranking/arkivering

**Leverans:** fungerande anslutningar, lagring och åtkomstkontroll + dokumentation

---

### `melker/memory-engine`

**Tech stack:** Python-worker, schemaläggning, Scaleway, extraktion, dubbletter, versionering, konflikter, arkivering, sökning, kontextpaket

**Vad branchen ska ha**

- Python-worker, schemaläggning och körning på Scaleway
- Extraktion ur chattar, enkel sortering (ämne + tid), dubbletter, versionering, konflikter, arkivering
- Sökning och **korta kontextpaket** till LLM (fråga in → relevant paket ut, inte hela historiken)
- Exempelchattar, egen testdatabas och testkö enligt **samma spec som Alfredo**

**Ska inte ha:** dashboard-UI, MCP/OAuth/desktop-gateway

**Leverans:** fungerande minnesmotor som kan kopplas på gemensam databas och kö

---

### `integration/v1`

**Tech stack:** Next.js, React, TypeScript, Tailwind, Vercel + FastAPI, MCP, Auth/OAuth, databasstruktur, RLS, kö + Python-worker, schemaläggning, Scaleway, extraktion, dubbletter, versionering, konflikter, arkivering, sökning, kontextpaket

**Vad branchen ska ha (efter merge)**

- Filips dashboard mot Alfredos riktiga API (mock av)
- Alfredos API mot Melkers worker (stub av)
- Melkers motor mot gemensam DB + kö
- Gemensam smoke: godkänt samtal in → extraherat minne → syns i dashboard → ny fråga får kort kontextpaket innan LLM svarar

**Används inte för daglig kod.** Mergeordning: Alfredo först, sedan Melker, sedan Filip.

**V1 när det sitter ihop:** desktop-appar kopplar, extraktion ur chattar, leverans av context till LLM, enkel sortering, enkel dashboard

---

Varje gren har också en `BRANCH.md` med mappförslag och klart-kriterier.
