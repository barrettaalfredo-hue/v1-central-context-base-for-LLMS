# Torsdag 17 september 2026 — integration och test

Tester körs på branchen **`integration/v1`**, inte på `main`.  
Merga `filip/dashboard`, `alfredo/integrations` och `melker/memory` dit (ordning: Alfredo → Melker → Filip). En vecka är målet; den riskabla delen är MCP/OAuth. Hur ni mergar: [integration-v1.md](integration-v1.md).

## Förutsättningar innan ni börjar testa

- [ ] Tre förskapade konton i Supabase Auth
- [ ] Supabase-projekt i **Stockholm**
- [ ] Vercel-backend i **Stockholm**
- [ ] Dashboard deployad (eller lokal mot samma backend)
- [ ] Fjärr-MCP-adress som går att klistra in i Claude Desktop
- [ ] Instruktionerna från [claude-instruktioner.md](claude-instruktioner.md) i Claude-projektet
- [ ] Melkers funktioner används av både dashboard-API och MCP (inte tre olika mockar)

## Tester som **måste** klaras

### 1. Claude sparar, dashboarden visar

- [ ] Logga in på dashboarden som Konto A
- [ ] Anslut Claude Desktop via fjärr-MCP och OAuth som Konto A
- [ ] I Claude: få den att spara testminnet **Lanseringsdatum** ([testexempel.md](testexempel.md))
- [ ] Verktyget returnerar lycka, inte `error`
- [ ] Inom 10 sekunder (eller efter uppdateringsknapp) syns minnet i dashboarden med rätt svensk kategorietikett

**Underkänd om:** Claude säger att det är sparat men raden saknas, eller dashboarden visar ett annat kontos data.

### 2. Samma konto, annan dator, ny chatt

- [ ] Logga in som Konto A på en **annan dator** (eller annan webbläsare + ny Claude-chatt)
- [ ] Anslut MCP på nytt, godkänn åtkomst
- [ ] Claude `search_memory` hittar Lanseringsdatum
- [ ] Dashboarden på den andra datorn visar samma rad

**Underkänd om:** minnet bara finns i den första sessionen eller kräver lokal fil.

### 3. Sökning, uppdatering, återförsök, inga identiska dubbletter

- [ ] `query: "oktober"` hittar Lanseringsdatum
- [ ] Filter kategori `deadline` och projekt `Projekt A` fungerar i dashboarden och via MCP
- [ ] Listan är senast uppdaterat först
- [ ] Uppdatera content till 22 oktober via `update_memory` — samma `id`, ny text i dashboarden
- [ ] Försök spara samma deadline igen: ingen andra identisk rad
- [ ] Återförsök efter ett avsiktligt fel (t.ex. ogiltig category) fungerar när indata är giltig

**Underkänd om:** två rader med samma title+content, eller sök missar text i `content`.

### 4. Fel är fel

- [ ] Fel mejl/lösenord → `INVALID_CREDENTIALS`, ingen session
- [ ] Ogiltig category → error, ingen rad
- [ ] Konto B försöker `update_memory` på Konto A:s `id` → error, raden oförändrad
- [ ] Claude (instruktionerna) bekräftar **inte** sparning när verktyget returnerade error
- [ ] Dashboarden visar feltext, inte en påhittad lyckad lista

**Underkänd om:** misslyckad sparning visas som lyckad någonstans.

## När V1 är levererad

Alla fyra block ovan är godkända av de tre personerna **på `integration/v1`**. Först då mergas `integration/v1` till `main`. Inte förr.
