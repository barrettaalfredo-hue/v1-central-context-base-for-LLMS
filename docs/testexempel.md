# Gemensamma testexempel V1

Alla tre använder **samma** rader. Filip visar dem i mock. Alfredo kan returnera dem som förutbestämda MCP-svar. Melker sparar/söker dem i simulerad lagring. Måndag ska **samma innehåll** kunna skapas av Claude och synas i dashboarden.

Konto i exemplen: det förskapade kontot som teamet använder för testdagen (e-post låses av Alfredo när kontona skapas). Projektnamn: `Projekt A`.

## Minnen som ska kunna sparas

### 1. Deadline

```json
{
  "project": "Projekt A",
  "category": "deadline",
  "title": "Lanseringsdatum",
  "content": "Vi lanserar 15 oktober 2026."
}
```

Efter lyckad sparning ska svaret även ha `id`, `created_at`, `updated_at` enligt [contracts.md](contracts.md).

### 2. Beslut

```json
{
  "project": "Projekt A",
  "category": "decision",
  "title": "Stack för V1",
  "content": "V1 kör TypeScript på Vercel och Supabase. Ingen Python-worker."
}
```

### 3. Faktum

```json
{
  "project": "Projekt A",
  "category": "fact",
  "title": "Tre testkonton",
  "content": "Det finns tre förskapade konton. Ingen offentlig registrering."
}
```

## Sökningar som ska träffa

| Anrop | Förväntat |
| --- | --- |
| `search_memory({ "project": "Projekt A" })` | Minst deadline-minnet ovan, senast uppdaterat först |
| `search_memory({ "category": "deadline" })` | Lanseringsdatum |
| `search_memory({ "query": "oktober" })` | Lanseringsdatum (träff i `content`) |
| `search_memory({ "query": "finns-inte-xyz" })` | Tom lista, inte fel |

## Uppdatering

1. Sök fram Lanseringsdatum.
2. `update_memory` med samma `id`, samma fält, men `content`: `"Vi lanserar 22 oktober 2026."`
3. `id` oförändrat. `updated_at` nyare. Dashboarden visar den nya texten. Ingen andra rad med identisk gammal + ny deadline.

## Dubbletter och återförsök

- Spara Lanseringsdatum två gånger i följd utan ändring: Claude ska enligt instruktionerna söka först och uppdatera befintligt `id`. Efter integration ska det **inte** ligga två identiska rader (samma konto, samma project, category, title, content).
- Om `save_memory` misslyckas (t.ex. ogiltig category): felobjekt, **ingen** rad i databasen, Claude/dashboard får **inte** “sparat”.

## Isolering mellan konton

Spara Lanseringsdatum som Konto A. Logga in som Konto B. `search_memory` och dashboardlista ska **inte** visa den raden. `update_memory` med Konto A:s `id` som Konto B ska ge fel, inte uppdatera.

## Inloggningsexempel

Lyckad inloggning (lösenord sätts av Alfredo, visas inte i git):

```json
{ "email": "filip@example.com", "password": "…" }
```

Lyckat svar:

```json
{ "data": { "id": "användarens UUID", "email": "filip@example.com" } }
```

Fel lösenord:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Fel mejl eller lösenord."
  }
}
```
