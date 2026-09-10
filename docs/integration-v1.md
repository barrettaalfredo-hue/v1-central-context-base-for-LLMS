# `integration/v1` — ihopkoppling och test före `main`

**Ägare:** Filip, Alfredo och Melker tillsammans.  
**Inte** för daglig feature-kod. Hit mergas de tre person-grenarna **torsdag 17 september 2026**. Här körs [torsdag-test.md](torsdag-test.md). **`main` rörs inte** förrän de fyra testerna är godkända.

## Vad den här branchen ska innehålla efter merge

Hela V1 mot **samma** Supabase och **samma** minnesfunktioner — inte tre mockar:

| Mapp | Kommer från | På den här branchen ska |
| --- | --- | --- |
| `apps/dashboard/` | `filip/dashboard` | Mock av. Pratar med Alfredos API. |
| `apps/api/` | `alfredo/integrations` | Stub av. Anropar Melkers `packages/memory`. Fjärr-MCP + Auth/RLS på riktigt. |
| `packages/memory/` | `melker/memory` | Riktiga regler. Lagring = Supabase via Alfredo, inte Melkers testdubbel. |

## Mergeordning (gör så här, inte allt på en gång)

1. Merga **`alfredo/integrations`** först — Auth, tabeller, RLS, MCP-adress.
2. Merga **`melker/memory`** — byt Alfredos förutbestämda svar mot `packages/memory`.
3. Merga **`filip/dashboard`** — byt Filips mock mot samma API.
4. Kör [torsdag-test.md](torsdag-test.md) på den här branchen (deploy eller lokal mot Stockholm-Supabase).

Vid konflikt:

- Databas, Auth, MCP-yta → Alfredo
- Validering, sök, spara/uppdatera → Melker
- UI, Tailwind, OAuth-vy, anslutningsguide → Filip
- Format i `docs/contracts.md` ändras **inte** här utan nytt ja från alla tre

## Vad som måste vara sant innan ni kallar V1 klar

Allt i [torsdag-test.md](torsdag-test.md):

1. Claude sparar ett minne som syns i dashboarden.
2. Samma konto hämtar det från annan dator och ny Claude-chatt.
3. Sök, uppdatering, återförsök, inga identiska dubbletter.
4. Fel är fel; misslyckad sparning aldrig som lyckad.

Dessutom:

- [ ] Ingen mock/stub som standardväg
- [ ] Dashboard och MCP använder **samma** `packages/memory`-funktioner
- [ ] Konto A ser inte Konto B
- [ ] MCP är fjärradress, ingen lokal server-install

## Vad som inte ska pushas hit

- Halvfärdiga experiment från en person
- Ny feature som bara en äger (lägg den på person-grenen först)
- Direkt-merge till `main` “för att det är torsdag” utan att testerna är gröna

## Efter godkända tester

Först då: merge `integration/v1` → `main`.
