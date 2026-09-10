# Claude-koppling V1 — fjärr-MCP

Ingen lokal MCP-server. Ingen lokal minnesapp.

```
Användare i Claude Desktop
        → fjärr-MCP på Vercel (Alfredo)
        → behörighet (Supabase-inloggning / OAuth)
        → Melkers minnesfunktioner
        → Supabase (Stockholm)
```

Dashboarden är **inte** i den kedjan när Claude sparar eller hämtar. Dashboarden läser **samma rader** i Supabase efteråt.

## Vad användaren gör

1. Logga in på dashboarden (förskapat konto).
2. Kopiera MCP-adressen (anslutningsguiden).
3. Lägg till den som **fjärranslutning** i Claude Desktop.
4. Logga in och **godkänn åtkomst** (OAuth-vy — Filip äger vyn, Alfredo äger Auth bakom).
5. Klistra in instruktionerna i Claude-projektet: [claude-instruktioner.md](claude-instruktioner.md).

## Vad Claude gör (V1-sanning)

Du skriver en vanlig fråga. Du ska inte skriva “hämta minne”.

Claude-modellen **anropar verktygen** enligt instruktionerna:

- före projektfrågor: `search_memory`
- när något ska sparas: `save_memory`
- när något redan finns: `search_memory` → ta `id` → `update_memory`

Det är instruktionstyrt. **Ingen garanti** att Claude alltid anropar. Systemet ska ändå aldrig ljuga: om verktyget misslyckas får Claude (och dashboarden) ett fel, inte ett fejk-lyckat minne.

## De tre verktygen

Se [contracts.md](contracts.md). Inga andra MCP-verktyg i V1.

## Vad tre personer synkar på

Inte möten. **Samma JSON** för ett minne.

| Person | Mot Claude | Mot JSON |
| --- | --- | --- |
| Alfredo | Fjärr-MCP + OAuth + RLS | Skickar/tar emot minnesobjektet |
| Melker | Aldrig | Skapar/söker/uppdaterar samma objekt |
| Filip | Aldrig (förutom anslutningsguide + OAuth-vy) | Visar samma objekt i listan |

Alfredo kan först svara med **förutbestämda** minnen i exakt exempel-JSON. Melker kan köra mot **simulerad lagring** med samma JSON. Filip kan visa **exempelminnen** med samma JSON. Torsdag byts mock mot samma funktioner och samma databas.
