# `packages/memory/` — Melkers leverans

**Person:** Melker  
**Branch:** `melker/memory`  
**Stack:** Vanliga **TypeScript-funktioner** (ingen Python, ingen worker, ingen kö, ingen Cron, ingen vektordb)  
**Arbetar självständigt med:** testdata och **simulerad lagring**; bygger regler, sökning och Claude-instruktioner.

Efter integration anropas **samma funktioner** av dashboardens serverkod och av MCP. Då pekar lagringen på Supabase via det Alfredo exponerar — inte en andra söklogik.

## Du måste leverera (annars är hjärnan inte klar)

### 1. Funktioner (samma in/ut som [docs/contracts.md](../../docs/contracts.md))

Minst:

- `validateMemoryInput` — `project` 1–100, `category` en av fem, `title` 1–150, `content` 1–10 000. Annars felkod, inget sparande.
- `saveMemory` — skapar minne för given `user_id`. Backend-fält `id` (UUID), `created_at`, `updated_at`.
- `updateMemory` — ändrar befintlig rad via `id` + `user_id`. Fel om fel ägare eller saknas. Ny `updated_at`.
- `searchMemory` — `project?`, `category?`, `query?`, `offset?`. `query` i `title` och `content`. Sortering: `updated_at` fallande.

Dashboard och MCP ska kunna importera **samma** modul. Inga duplicerade regler i Filips eller Alfredos kod efter torsdag.

### 2. Simulerad lagring + testdata

- In-memory eller fil, spelar ingen roll — men form och regler identiska med kontraktet.
- Ladda [docs/testexempel.md](../../docs/testexempel.md) som fixtures.
- Tester som **måste grönt** på din gren:
  - spara Lanseringsdatum → sök `"oktober"` träffar
  - filter `category=deadline` och `project=Projekt A`
  - uppdatera content till 22 oktober, samma `id`
  - ogiltig category → error, 0 rader
  - två user_id: A:s minne syns inte i B:s sök
  - identisk om-sparning: dokumentera och implementera den regel ni behöver för **inga identiska dubbletter** (sök-före-spar som Claude ska göra; funktion som kan hitta befintlig rad med samma user+project+category+title+content så MCP/instruktioner kan uppdatera `id` i stället)

### 3. Claude-instruktioner

- Äg [docs/claude-instruktioner.md](../../docs/claude-instruktioner.md).
- Texten ska stämma med `save_memory` / `search_memory` / `update_memory`.
- Förklara i paketets README hur instruktionen mappar till funktionerna (sök före spar, uppdatera vid tydlig ändring, bekräfta bara efter lyckat svar).

### 4. Uppdateringsflöde (produktregel)

När minne ska uppdateras: **sök** → ta `id` → `updateMemory`. Du bygger stöd för det. Du bygger **inte** versionshistorik eller automatisk merge vid motstridiga texter.

## Du ska inte bygga

- FastAPI, Python-worker, Scaleway, Redis-kö, embeddings, konfliktsmotor, arkiv/glömma.
- Next.js-sidor, MCP-server, OAuth, Supabase-projekt (Alfredo).
- ChatGPT.
- Extra fält (`topic`, `source`, `version`, `status`) — de är borttagna ur V1.

## Klart på din gren när

- [ ] Funktionerna validerar, sparar, uppdaterar, söker enligt kontraktet mot simulerad lagring
- [ ] Alla testexempel i `docs/testexempel.md` har automatiska tester som går grönt
- [ ] Isolering mellan två `user_id` är testad
- [ ] Instruktionstexten är färdig och kopierbar
- [ ] Exporten är en TypeScript-modul som Alfredo och Filip kan importera utan att skriva om regler

Torsdag mergas den här grenen till **`integration/v1`** (efter Alfredo, före Filip). Inte direkt till `main`.
