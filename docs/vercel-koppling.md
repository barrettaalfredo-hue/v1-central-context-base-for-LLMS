# Vercel-koppling

Ett Vercel-projekt för **hela** GitHub-repot `barrettaalfredo-hue/v1-central-context-base-for-LLMS`. Inte “bara en branch för alltid”. Första preview ska komma från `alfredo/integrations`. `main` är inte live V1 förrän måndagstesterna är godkända.

## Redan gjort (agent, 11 sept 2026)

- Cursor-plugin `vercel/vercel-plugin` är installerad.
- Vercel MCP är inloggad på Hobby-teamet **barrettaalfredo-hue's projects** (`barrettaalfredo-hues-projects`).
- `vercel.json` sätter funktionsregion **Stockholm (`arn1`)**.

## Blockerat tills Alfredo klickar en gång

Git-länken misslyckades med:

> To link a GitHub repository, you need to install the GitHub integration first.

Vercel GitHub-appen är **inte** installerad på GitHub-kontot `barrettaalfredo-hue`. Den finns däremot på ett **annat** GitHub-konto, se nedan.

### Alfredo gör detta

1. Installera Vercel-appen på GitHub-kontot `barrettaalfredo-hue` och ge den tillgång till **det här** repot: [https://github.com/apps/vercel](https://github.com/apps/vercel)
2. Importera hela repot till samma Hobby-team: [https://vercel.com/new/import?s=https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS](https://vercel.com/new/import?s=https://github.com/barrettaalfredo-hue/v1-central-context-base-for-LLMS)
3. Välj team **barrettaalfredo-hue's projects**.
4. Sätt **inte** `main` som live V1. Första preview: branchen `alfredo/integrations`.
5. Bekräfta att funktioner körs i **Stockholm (`arn1`)** (finns redan i `vercel.json`).
6. Skicka tillbaka till teamet: **projektnamn + preview-URL**. Inga hemligheter.

När appen är installerad kan agenten köra om git-länken.

## Inte det här projektet

På samma Vercel-team finns redan **`central-context-base-llm`**, kopplat till ett **annat** GitHub-repo:

- GitHub: `infoalfredobarretta-dotcom/Central-context-base-llm`
- Domän: `central-context-base-llm.vercel.app`

Det är inte teamrepot. Använd det inte som V1-host för den här koden.

## Miljönamn (inga värden i git)

Lägg värdena i Vercel-projektet (Preview + Production), inte i README.

| Namn | Vart | Kommentar |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Publik projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Anon-nyckel. RLS ska stoppa främmande rader. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Bara server** | Aldrig `NEXT_PUBLIC_*`, aldrig i git |

När Supabase-projektet finns: klistra in värdena i Vercel. Skicka bara **projekt-ref** (t.ex. `abcdxyz`) tillbaka, inte nycklar.
