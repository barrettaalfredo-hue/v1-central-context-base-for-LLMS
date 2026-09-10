# `apps/dashboard/` — Filips leverans

**Person:** Filip  
**Branch:** `filip/dashboard`  
**Stack:** Next.js, React, TypeScript, Tailwind, deploy på **Vercel**  
**Arbetar självständigt med:** simulerade API-svar, inloggning och exempelminnen från [docs/testexempel.md](../../docs/testexempel.md). Mocken ska följa [docs/contracts.md](../../docs/contracts.md) **exakt**.

Torsdag byts mock mot Alfredos API + Melkers funktioner. Bygg inte om vyerna då — bara anslutningen.

## Du måste leverera (annars är dashboarden inte klar)

### Sidor och beteende

1. **Inloggning**
   - E-post + lösenord.
   - Request: `{ "email": "…", "password": "…" }`.
   - Visa inloggad användare från `{ "data": { "id", "email" } }`.
   - Fel lösenord: visa `{ "error": { "code": "INVALID_CREDENTIALS", "message": "Fel mejl eller lösenord." } }`.
   - Ingen registreringsvy.

2. **Utloggning**
   - Vid lycka: `{ "data": { "success": true } }` och tillbaka till inloggning.

3. **Minneslista**
   - Visa `project`, svensk kategorietikett, `title`, `content`, `updated_at`.
   - Sortering: **senast uppdaterat först**.
   - Tom lista är ett giltigt läge, inte ett fel.

4. **Sökning och filter**
   - Textsök i titel och innehåll.
   - Filter på `project` och `category`.
   - Kategorier i UI: Faktum, Beslut, Mål, Deadline, Preferens (värden mot API: `fact`, `decision`, `goal`, `deadline`, `preference`).

5. **Uppdatering av listan**
   - Automatisk hämtning **var 10:e sekund** när fliken/sidan är aktiv.
   - En **uppdateringsknapp** som hämtar omedelbart.

6. **Anslutningsguide (obligatorisk V1-feature)**
   - Visa MCP-adressen så den kan kopieras.
   - Visa var i Claude Desktop användaren lägger fjärranslutningen.
   - Visa instruktionstexten från [docs/claude-instruktioner.md](../../docs/claude-instruktioner.md) så den kan kopieras in i Claude-projektet.
   - Steg: logga in här → kopiera MCP-adress → godkänn åtkomst → klistra in instruktioner.

7. **OAuth-godkännandevy**
   - Filip **äger vyn** där användaren godkänner att Claude får åtkomst.
   - Följ samma inloggade konto. Hitta inte på ett annat konto än det som just loggade in på dashboarden.
   - Alfredo kopplar vyn mot riktig Supabase OAuth; tills dess: simulerat godkännande som slutar i tydlig “ansluten” / “nekad” / feltext.

8. **Fel**
   - Nätverksfel, ogiltig session (`data: null`), tom sökning och auth-fel ska synas som text.
   - Visa **aldrig** ett minne som sparat om API:t skickade `error`.

### Mock-data du ska ha inbyggd

De tre exempelminnena i [docs/testexempel.md](../../docs/testexempel.md) (Lanseringsdatum, Stack för V1, Tre testkonton), med påhittade `id` och tidsstämplar i rätt format.

## Du ska inte bygga

- Python, worker, kö, Supabase-schema, MCP-server, ChatGPT.
- Konfliktsida, versionshistorik, projekthantering (egen tabell), publik signup.
- Eget minnesformat. Inte `topic`/`text` från gamla planen — fälten är `project`, `category`, `title`, `content`.

## Klart på din gren när

- [ ] Inloggning, felinloggning och utloggning följer JSON-kontraktet
- [ ] Lista, sök, filter och 10-sekunders-refresh fungerar mot mock
- [ ] Anslutningsguide + OAuth-vy går att klicka igenom
- [ ] Svenska kategorietiketter stämmer
- [ ] README i den här mappen förklarar `npm run dev` / Vercel
- [ ] Ingen kod beror på att Alfredos eller Melkers tjänster körs
