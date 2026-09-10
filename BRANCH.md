# Branch: `alfredo/integrations`

**Ägare:** Alfredo  
**Bas:** `main`  
**Jobba här tills anslutningar, lagring och åtkomstkontroll fungerar.** Pusha fritt — krocka inte med Filips eller Melkers grenar.

Det här är **navet**: hur desktop-appar skickar in samtal, hur data lagras, vem som får se vad, och hur kön ser ut. Det är **inte** dashboard-UI och **inte** den riktiga minnesmotorn.

## Syfte

Claude Desktop och ChatGPT Desktop ska kunna koppla till minnessystemet. Systemet ska ta emot godkända samtal, spara dem, styra åtkomst och kunna ge (senare: Melkers) motor något att läsa. I V1 räcker en **simulerad minnesmotor** med förutbestämda svar så Alfredo kan testa hela röret utan Melker.

## Tech stack (bara här)

- FastAPI
- MCP (Model Context Protocol)
- Klientanslutningar (Claude Desktop, ChatGPT Desktop)
- Insamling av godkända samtal
- Auth / OAuth
- Databasstruktur + RLS
- Kö + backenddrift

## Vad som ska finnas i den här branchen

```
apps/api/                # FastAPI
  auth/                  # OAuth, sessioner, API-nycklar
  mcp/                   # MCP-server mot desktop-appar
  ingest/                # ta emot godkända samtal
  db/                    # schema, RLS, migrationer
  queue/                 # kökontrakt (händelser in/ut)
  memory_stub/           # simulerad minnesmotor (förutbestämda svar)
tools/api-tester/        # testverktyg som ersätter dashboarden
docs/desktop-support.md  # vad Claude/ChatGPT desktop faktiskt stöder
docs/contracts.md        # gemensam spec Melker och Filip ska spegla
```

**Måste med i V1:**

1. **Klientanslutningar** — Claude Desktop och ChatGPT Desktop kopplar till minnessystemet (MCP eller det som apparna faktiskt tillåter).
2. **Insamling** — godkända samtal tas emot och lagras. LLM:en ska inte själv välja vad som sparas.
3. **Auth/OAuth** — inloggning och åtkomstkontroll.
4. **Databasstruktur + RLS** — tabeller för användare, anslutningar, råsamtal, minnen, konflikter; radnivå-säkerhet.
5. **Kö** — händelser t.ex. `conversation.ingested`, `memory.requested`. Melker bygger mot **samma** kökontrakt.
6. **Simulerad minnesmotor** — förutbestämda svar (kontextpaket / sökresultat) så API:t kan leverera information till LLM utan Melker.
7. **Testverktyg** — ersätter Filips dashboard: anropa ingest, lista minnen, hämta kontextpaket, se fel.
8. **Dokumentation** — vad desktop-apparna faktiskt stöder (begränsningar, auth, MCP-verktyg, vad som inte går).

**`docs/contracts.md` är Alfredos ansvar** och är den spec Melker speglar i testdatabas/testkö och som Filip speglar i mock-API:t:

- form på minne (ämne, tid, källa, version, status)
- form på konflikt
- kömeddelanden
- hur ett kort kontextpaket ser ut när det skickas till LLM **innan** svaret skrivs

## Vad som inte ska ligga här

- Next.js-dashboard, Tailwind-vyer, Vercel-frontend (Filip)
- Riktig extraktion, dubbletthantering, arkivering, ranking över tid (Melker)
- Att låta Claude/ChatGPT själva besluta vad som ska sparas

## Arbeta självständigt med

En simulerad minnesmotor med förutbestämda svar och ett testverktyg som ersätter dashboarden.

## Leverans till `integration/v1`

Fungerande anslutningar, lagring och åtkomstkontroll, plus dokumentation om vad desktopapparna faktiskt stöder. Då kan Filips mock bytas mot det här API:t och Melkers stub bytas mot den riktiga motorn.

## Klart-kriterium för den här branchen

- Desktop-anslutning kan skicka in ett godkänt samtal
- Samtalet landar i DB + kö
- Testverktyget kan hämta ett kort “kontextpaket” från stubben
- RLS: en användare ser inte en annans data
- `docs/contracts.md` och `docs/desktop-support.md` finns
