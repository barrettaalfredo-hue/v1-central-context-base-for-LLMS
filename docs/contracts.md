# Kontrakt V1 — låst format

Alla tre bygger mot den här filen. Formatet är JSON för informationen och TypeScript för koden. **Ändras bara efter överenskommelse.**

Status: **LÅST** enligt 1-veckasplanen.

## Minne (det som dashboard, MCP och hjärnan delar)

Databasen lagrar dessutom `user_id`. `user_id` skickas **inte** i dashboard- eller MCP-svar till klienten som ett fält Claude får hitta på. Ägare = inloggning.

| Fält | Format och regel | Vem fyller i |
| --- | --- | --- |
| `id` | Unikt UUID som text | Backend |
| `project` | Text, 1–100 tecken | Claude |
| `category` | Endast `fact`, `decision`, `goal`, `deadline` eller `preference` | Claude |
| `title` | Text, 1–150 tecken | Claude |
| `content` | Text, 1–10 000 tecken | Claude |
| `created_at` | UTC, t.ex. `2026-09-10T12:00:00Z` | Backend |
| `updated_at` | Samma datumformat | Backend |

Kategorietiketter i dashboarden (svenska):

| `category` | Etikett |
| --- | --- |
| `fact` | Faktum |
| `decision` | Beslut |
| `goal` | Mål |
| `deadline` | Deadline |
| `preference` | Preferens |

### Exempel (svar utan `user_id`)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "project": "Projekt A",
  "category": "deadline",
  "title": "Lanseringsdatum",
  "content": "Vi lanserar 15 oktober 2026.",
  "created_at": "2026-09-10T12:00:00Z",
  "updated_at": "2026-09-10T12:00:00Z"
}
```

Ogiltig `category`, tom `title`, `project` över 100 tecken eller `content` över 10 000 tecken = fel, inget minne sparat.

## Inloggning

Tre förskapade konton (e-post + lösenord). Ingen registreringsvy i V1.

| Händelse | Exakt format |
| --- | --- |
| Skicka inloggning | `{ "email": "filip@example.com", "password": "…" }` |
| Inloggad användare | `{ "data": { "id": "användarens UUID", "email": "filip@example.com" } }` |
| Inte inloggad | `{ "data": null }` |
| Lyckad utloggning | `{ "data": { "success": true } }` |
| Fel | `{ "error": { "code": "INVALID_CREDENTIALS", "message": "Fel mejl eller lösenord." } }` |

Filips mock och Alfredos riktiga Auth ska följa **samma** JSON utåt mot dashboarden.

## MCP-verktyg (gränssnitt)

Argumentnamn och betydelse är låsta. Behörighet: alltid den inloggade användaren, aldrig ett user-id från Claude.

### `save_memory`

In: `{ "project": string, "category": string, "title": string, "content": string }`  
Ut vid lycka: ett minnesobjekt som ovan.  
Ut vid fel: `{ "error": { "code": string, "message": string } }` — får **aldrig** se ut som lyckad sparning.

### `search_memory`

In: `{ "project"?: string, "category"?: string, "query"?: string, "offset"?: number }`  
Ut: lista av minnesobjekt, `updated_at` fallande. Tom lista är giltig, inte fel.  
`query` söker i `title` och `content`.

### `update_memory`

In: `{ "id": string, "project": string, "category": string, "title": string, "content": string }`  
Ut vid lycka: uppdaterat minnesobjekt (`updated_at` nytt, `id` samma).  
Ut vid fel (finns inte, tillhör annan användare, ogiltiga fält): error-objekt, aldrig ett “lyckat” minne.

## Hjärnans funktioner (Melker) — samma kontrakt

TypeScript-funktioner som både dashboard-API och MCP anropar efter ihopkoppling:

- validera `category` / längder
- spara (skapar `id` + tidsstämplar via backend/lagring)
- uppdatera via `id`
- söka (`query`, `project`, `category`, `offset`) med senast uppdaterat först

Simulerad lagring hos Melker och riktig Supabase hos Alfredo ska ge **samma form** på in och ut.

## Säkerhet

Konto A får aldrig läsa eller uppdatera Konto B:s minnen, även om minnes-`id` är känt. Tester måste visa det.
