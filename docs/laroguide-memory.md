# Läroguide: vad Melker har byggt

Den här filen är en genomgång för någon som aldrig skrivit TypeScript eller JavaScript. Du behöver inte kunna programmera för att läsa den. Målet är att du skall kunna förklara **vad** som finns, **varför** det finns, och **vem** som gör vad på måndag.

Om du bara skall läsa en sak till: [claude-instruktioner.md](claude-instruktioner.md) är texten Claude skall ha. [torsdag-test.md](torsdag-test.md) är checklistan för testdagen.

---

## 1. Vad är produkten?

V1 är ett **privat molnminne för Claude**.

Tänk så här. Claude glömmer mellan chattar. Ni vill att den skall kunna lägga en lapp i ett kassaskåp och hämta lappen senare. Kassaskåpet är en databas i Stockholm. Nyckeln är inloggning. Varje person har sitt eget fack. Filip skall inte kunna öppna Melkers fack.

En lapp kallas ett **minne**. Ett minne är inte en hel chatt. Det är en kort, bekräftad sak: ett datum, ett beslut, ett faktum.

Claude Desktop är programmet där ni chattar. Den får tre knappar (verktyg):

1. `search_memory` = leta i kassaskåpet
2. `save_memory` = lägg in en ny lapp
3. `update_memory` = ändra en lapp som redan har ett nummer

Claude väljer själv när den trycker. Den gör det inte automatiskt på varje mening. Därför finns en instruktionstext som ni klistrar in i Claude-projektet.

---

## 2. Tre personer, tre rum

Ni är tre. Varje person äger ett rum. Ni skall inte skriva kod i varandras rum.

| Person | Rum | Vad det betyder i vanligt språk |
| --- | --- | --- |
| Alfredo | `apps/api/` | Dörren. Inloggning, kopplingen till Claude, kopplingen till databasen, webbadressen på internet. |
| Melker | `packages/memory/` | Hjärnan. Reglerna för vad som får sparas, hur sök funkar, vad som är en dubblett. |
| Filip | dashboarden | Skärmen. En sida där en människa ser samma lappar som Claude just lade in. |

Efter måndag anropar både Claude-dörren och dashboarden **samma hjärna**. Då finns reglerna bara på ett ställe. Om någon skriver en andra söklogik i dashboarden eller i API:t får ni två sanningar.

`docs/contracts.md` är låst kontrakt. Det är överenskommelsen om hur en lapp ser ut. Ändra den inte ensam.

---

## 3. Ord du kommer att se

Läs det här avsnittet som en ordlista. Du behöver inte kunna skriva något av det.

**Git** är ett minne för kod. Varje ändring är en **commit** (en sparad version med en mening om vad som ändrades).

Ett **repo** (repository) är hela projektmappen på GitHub. Er repo heter `v1-central-context-base-for-LLMS`.

En **gren** (branch) är en kopia av koden där någon får jobba utan att förstöra andras arbete. Melkers gren heter `melker/memory`. Alfredos heter `alfredo/integrations`. Den gemensamma testdagsgrenen heter `integration/v1`. `main` är den gren som till slut blir “den riktiga sidan”. Den är nästan tom än. Rör den inte på måndag.

En **PR** (pull request) är en begäran: “ta in de här ändringarna i den där grenen”. PR #14 tog in hjärnan i `melker/memory`. PR #15 tog in tydligare Claude-text och måndagstester. PR #13 är stängd. Den skall inte in.

**TypeScript** är språket koden är skriven i. Det liknar JavaScript men med extra namnskyltar på data (“det här skall vara text”, “det här skall vara ett tal”). Du behöver inte lära dig det. Tänk “recept med tydliga ingredienslistor”.

En **funktion** är ett namngivet recept. `saveMemory` betyder: ta emot en lapp, kolla den, spara den, lämna tillbaka ett svar.

**JSON** är hur datorer skickar en lapp till varandra. Det ser ut som en lista med namn och värden inom klamrar. Exempel:

```json
{
  "project": "Projekt A",
  "category": "deadline",
  "title": "Lanseringsdatum",
  "content": "Vi lanserar 15 oktober 2026."
}
```

Du kan läsa JSON. Det är den gemensamma formen för Claude, hjärnan, HTTP och dashboarden.

**HTTP** är hur webbsidor pratar med servern. Dashboarden säger “hämta minnen” till en adress som `/api/memories`. Servern svarar med JSON.

**MCP** är protokollet Claude Desktop använder för att trycka på verktygen. Tänk “en extra sladd mellan Claude och er server”. Alfredo äger sladden.

**OAuth** är inloggningen i den sladden. Claude skall inte få ett lösen inskrivet i chatten. Användaren loggar in i webbläsaren. Sedan vet servern vem det är.

**Supabase** är databasen (plus inloggning) i Stockholm. Där ligger tabellen `memories`. Alfredo äger projektet. Melker skriver inte dit live.

**Vercel** är stället där servern körs på internet. Root Directory är `apps/api`. Det betyder: “börja bygget i Alfredos mapp”. Melkers paket ligger en nivå upp. Därför måste Alfredo peka ut det. Se avsnitt 12.

**UUID** är ett långt id som en dator hittar på, till exempel `550e8400-e29b-41d4-a716-446655440000`. Det är lappens nummer. Människor skall inte hitta på ett.

**RLS** (row level security) är lås i databasen. En rad har en ägare. Databasen vägrar visa eller ändra rader som inte är dina, även om någon gissar id:t.

**Result** är kuvertet svaret kommer i. Antingen lycka eller fel. Aldrig båda. Aldrig bara lappen utan kuvert. Se avsnitt 8.

---

## 4. Hur en lapp ser ut

En sparad lapp har sju fält som klienten får se:

| Fält | Vanligt språk | Vem fyller i |
| --- | --- | --- |
| `id` | Lappens nummer | Datorn |
| `project` | Vilket projekt lappen hör till, på testdagen alltid `Projekt A` | Claude |
| `category` | Typ av lapp. Bara fem engelska ord: `fact`, `decision`, `goal`, `deadline`, `preference` | Claude |
| `title` | Rubrik | Claude |
| `content` | Själva texten | Claude |
| `created_at` | När lappen skapades | Datorn |
| `updated_at` | När lappen senast ändrades | Datorn |

Databasen har också `user_id` (vem afacket tillhör). Det fältet skall **aldrig** skickas tillbaka till Claude eller dashboarden. Annars läcker vem som äger lappen ut i onödan, och någon kan börja skicka fel ägare.

Tider ser alltid ut så här: `2026-09-10T12:00:00Z`. Det är UTC (världsklocka) utan tiondelar. `Z` betyder “noll tidszon”, alltså inte svensk sommartid i själva siffrorna.

Längder:

- `project`: 1 till 100 tecken
- `title`: 1 till 150 tecken
- `content`: 1 till 10 000 tecken

Blanksteg i början och slutet tas bort **före** längdkollen. En rubrik med bara mellanslag räknas som tom. Det är ett fel. Inget sparas.

---

## 5. Vägen från chatt till databas

Läs det här som en kedja. Varje länk har en ägare.

1. Du skriver till Claude: “Kom ihåg att Projekt A skall lanseras den 15 oktober.”
2. Instruktionerna säger att Claude skall **söka först**. Claude trycker `search_memory`.
3. Trycket går via MCP-sladden till Alfredos server.
4. Servern vet vem du är (inloggning). Den tar fram ditt `userId`.
5. Servern anropar Melkers funktion `searchMemory` med det id:t.
6. Funktionen hämtar **dina** rader och filtrerar. Den lämnar tillbaka ett kuvert.
7. Alfredo skickar lyckans innehåll till Claude (själva listan, inte kuvertet).
8. Hittade Claude ingen lapp? Då trycker den `save_memory` med `category`: `deadline`.
9. Melkers `saveMemory` kollar fälten. Sedan ber den lagret att stoppa in raden.
10. I produktion är lagret Supabase. En databasregel sätter `user_id` från inloggningen. Claude skickar inte `user_id`.
11. Svaret går tillbaka. Claude får se `id` och tiderna. Först då får den säga “sparat”.
12. Filips sida kan hämta samma rad via HTTP. Samma `id`. Samma text.

Om steg 5 hoppas över och Alfredo har en egen kopia av reglerna får ni två hjärnor. Det är därför `apps/api/lib/memory/` skall raderas **efter** att Alfredo pekat på paketet.

---

## 6. Vad som faktiskt skapades

Här är leveransen, i vanligt språk.

### 6.1 Hjärnan: `packages/memory/`

Ett **paket** är en mapp med kod som andra får importera. Namnet utåt är `@v1/memory`. Tecknet `@` är bara en namnrymd, som ett efternamn på ett bibliotek.

Innehåll:

| Fil | Vad den gör |
| --- | --- |
| `src/types.ts` | Namnskyltarna. Vad en lapp är. Vad ett fel är. Kopierad oförändrad från Alfredo. |
| `src/validate.ts` | Dörrvakten. Kastar ut ogiltig text. Kopierad oförändrad från Alfredo. |
| `src/time.ts` | Putsar klockslag till rätt form utan millisekunder. |
| `src/store.ts` | Reglerna. Spara, sök, uppdatera. Pratar med ett lager under, inte med databasen direkt. |
| `src/in-memory.ts` | Ett låtsaslager i datorns minne. Används av tester. Glöms när processen dör. |
| `src/supabase.ts` | Det riktiga lagret. Skickar insert/update/select till Supabase. Ingen söklogik här. |
| `src/index.ts` | Innehållsförteckningen. Det andra importerar. |
| `test/*.test.ts` | Automatiska prov. 41 stycken. |
| `README.md` | Kort leveranssedel till Alfredo och Filip. |

Vi **lyfte** koden. Det betyder: vi flyttade hjärnan som redan fanns hos Alfredo, i stället för att skriva en ny. En tidigare PR (#13) skrev en ny hjärna med fel kuvert. Den är stängd.

### 6.2 Dokument

| Fil | Vad den är |
| --- | --- |
| [contracts.md](contracts.md) | Låst kontrakt. Rördes inte. |
| [testexempel.md](testexempel.md) | Tre exempel-lappar ni alla skall använda. |
| [claude-instruktioner.md](claude-instruktioner.md) | Text att klistra **exakt** i Claude. |
| [torsdag-test.md](torsdag-test.md) | 18 tester för måndag 14 september. Filnamnet är gammalt. |
| [integration-v1.md](integration-v1.md) | Hur ni mergar till testdagsgrenen. |
| Den här filen | Läroguide. |

### 6.3 Confluence

I utrymmet Teknisk dokumentation finns en överlämningssida för Melker, skriven som syskon till Alfredos sida. Den är för teamet. Den här `.md`-filen är för dig.

### 6.4 Git-händelser du kan nämna

- Gren `melker/memory` hade först bara dokument.
- PR #14 la in paketet. Mergad.
- PR #15 la in den långa Claude-texten och måndagstesterna. Mergad.
- PR #13 (en annan hjärna) är stängd utan merge.

---

## 7. De fyra jobben, utan kodkunskap

### Jobb 1. Validera

Innan något sparas går texten genom en vakt.

Ordning om flera saker är fel: först `project`, sen `title`, sen `content`, sen `category`. Ett fel i taget. Inte en lista med tio fel.

Vakten trimmar (tar bort tomrum i kanterna) först. Sedan mäter den längd. Sedan kollar den att `category` är ett av de fem engelska orden.

Ogiltig category, till exempel `Deadline` eller `Faktum` eller `nope`, är fel. Inget sparas. Claude får inte säga “sparat”.

Ett id som inte ser ut som ett UUID är fel när man uppdaterar.

### Jobb 2. Spara (`saveMemory`)

Ingredienser: vem (`userId`) och lappen (`project`, `category`, `title`, `content`).

1. Vakta.
2. Be lagret lägga in raden.
3. Gick det? Lämna tillbaka lappen med `id` och tider.
4. Sa lagret “det här finns redan”? Hämta den gamla raden. Lämna tillbaka **samma** `id` och **samma** `updated_at`. Det är lycka. Inte ett fel.
5. Gick varken 3 eller 4? Felkod `SAVE_FAILED`.

“Finns redan” betyder: samma person, samma project, samma category, samma title, samma innehåll. Innehållet jämförs som databasen gör, med ett fingeravtryck som heter `md5`. Du behöver inte veta mer än: samma bokstäver i content räknas som samma lapp.

### Jobb 3. Söka (`searchMemory`)

Ingredienser: vem, och valfritt `project`, `category`, `query`, `offset`.

1. Vakta sökfälten.
2. Hämta personens **alla** rader från lagret (i produktion filtrerar databasen redan på ägare).
3. Om `project` skickades: behåll bara exakt den stavningen. `Projekt a` ger noll träffar om lappen heter `Projekt A`.
4. Om `category` skickades: samma sak, exakt.
5. Om `query` skickades: städa bort tecknen `% _ , ( )` och gör dem till mellanslag. Finns inget kvar? Då är det inte en textsökning. Då får du bara filtren ovan.
6. Finns det text kvar? Leta den i rubrik och innehåll. Stor eller liten bokstav spelar ingen roll. `Oktober` hittar `oktober`.
7. Sortera så nyast ändrad kommer först.
8. Hoppa `offset` rader. Ge högst 50.

Tom lista är lycka. “Inget fanns” är inte ett fel.

### Jobb 4. Uppdatera (`updateMemory`)

Ingredienser: vem, lappens `id`, och **alla** fält igen. Det finns ingen halv uppdatering.

1. Kolla att `id` är ett UUID.
2. Vakta fälten.
3. Be lagret ändra raden som både har det `id`:t **och** tillhör personen.
4. Finns den inte, eller tillhör den någon annan? Samma fel båda gångerna: `NOT_FOUND` och meningen `Minnet finns inte eller tillhör ett annat konto.` Felet får inte avslöja att id:t finns hos någon annan.
5. Gick det? Samma `id`. Samma `created_at`. Ny `updated_at`. Även om texten inte ändrades byts klockslaget. Då hamnar lappen först i sök.

Rätt flöde för Claude: sök, läs `id` från träffen, uppdatera. Hitta inte på ett `id`.

---

## 8. Kuvertet: lycka eller fel

Varje funktion lämnar tillbaka **ett** av två kuvert.

Lycka:

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "project": "Projekt A",
    "category": "deadline",
    "title": "Lanseringsdatum",
    "content": "Vi lanserar 15 oktober 2026.",
    "created_at": "2026-09-10T12:00:00Z",
    "updated_at": "2026-09-10T12:00:00Z"
  }
}
```

Fel:

```json
{
  "error": {
    "code": "INVALID_CATEGORY",
    "message": "category måste vara fact, decision, goal, deadline eller preference."
  }
}
```

Titta efter ordet `error`. Finns det? Då är det inte sparat. Finns `data` och ett `id`? Då gick det.

Alfredos Claude-sladd packar upp kuvertet och visar själva `data` för Claude. Om någon skulle skicka lappen **utan** kuvert blir den uppackningen tom och Claude ser ordet `undefined`. Det var felet i PR #13.

Några koder du kan känna igen:

| Kod | Betydelse |
| --- | --- |
| `INVALID_PROJECT` | Projektnamnet är tomt eller för långt |
| `INVALID_TITLE` | Rubriken är tom eller för lång |
| `INVALID_CONTENT` | Texten är tom eller för lång |
| `INVALID_CATEGORY` | Fel sorts lapp |
| `INVALID_ID` | Numret ser inte ut som ett UUID |
| `INVALID_OFFSET` | Hoppet är inte ett heltal 0 eller mer |
| `NOT_FOUND` | Lappen finns inte, eller den är inte din |
| `SAVE_FAILED` | Lagret kunde inte spara |
| `SEARCH_FAILED` | Lagret kunde inte lista |
| `UPDATE_FAILED` | Lagret kunde inte uppdatera |

De tre sista finns i koden. De står inte i det låsta kontraktet. Vi behåller dem ändå, för Alfredo har dem redan.

---

## 9. Två lager under hjärnan

Hjärnan vet inte om den pratar med låtsas eller på riktigt. Den ber ett **lager** om fyra saker: lägg in, hitta identisk, uppdatera, lista personens rader.

**Låtsaslagret** (`createInMemoryStore`) bor i RAM. Tester använder det. Det sätter `user_id` själv. Det använder samma dubblettnyckel som databasen. När testet tar slut är datan borta. Det är meningen.

**Riktiga lagret** (`createSupabaseStore`) skickar SQL-liknande anrop till Supabase. Det skickar **inte** `user_id` vid insert. En databasregel (trigger) sätter ägaren från inloggningen. Listan litar på RLS: du ser bara dina rader. Därför måste `userId` som Alfredo skickar in i funktionen vara **samma person** som JWT:n. Annars kan reglerna och databasen peka på olika människor.

Vi har en **låtsas-Supabase** i testerna. Den låtsas som trigger, lås och dubblettfel `23505` (databasens kod för “det här finns redan”). Den skriver inte till Stockholm.

---

## 10. De tre exempel-lapparna

Alla tre i teamet använder samma exempel. De står i [testexempel.md](testexempel.md).

1. Deadline: Projekt A, lansering 15 oktober 2026, rubrik Lanseringsdatum.
2. Beslut: V1 kör TypeScript på Vercel och Supabase. Ingen Python-worker.
3. Faktum: tre förskapade konton. Ingen offentlig registrering.

Sökordet `oktober` skall träffa deadline-lappen. Ordet `finns-inte-xyz` skall ge tom lista, inte fel. Efter uppdatering till 22 oktober skall `id` vara samma.

---

## 11. Tester: datorn rättar sig själv

Ett **automatiskt test** är ett litet program som gör en sak och kollar svaret. “Spara lappen. Sök på oktober. Fick vi rubriken Lanseringsdatum? Ja eller nej.”

Ni kör 41 sådana. Kommandot, om du har Node installerat:

```bash
cd packages/memory
npx tsx --test test/**/*.test.ts
```

`cd` betyder “gå in i mappen”. `npx tsx --test` betyder “kör testerna med verktyget tsx”. Du behöver inte förstå mer.

Vad testerna bevakar, i vanligt språk:

- ogiltig category sparar noll rader
- oktober-sök träffar deadline
- `Projekt a` missar `Projekt A`
- person B ser inte person A:s lapp
- person B som försöker ändra A:s id får samma fel som ett påhittat id
- spara samma lapp två gånger ger samma id
- högst 50 rader per sök
- tider utan millisekunder
- låtsaslagret och låtsas-Supabase ger samma svar på samma kedja

Grönt = 41 pass, 0 fail. Det bevisar hjärnan. Det bevisar **inte** att Vercel-preview bygger, att Claude är inkopplad, eller att Filips skärm finns.

---

## 12. Vad Alfredo måste göra (inte du)

Hans server pekar idag på en kopia av hjärnan inne i `apps/api/lib/memory/`. Efter merge skall den peka på paketet.

Tre tekniska rader, förklarade:

1. `"@v1/memory": "file:../../packages/memory"`  
   “När du hör namnet `@v1/memory`, läs mappen två nivåer upp, sen `packages/memory`.”  
   `..` betyder “en mapp upp”. Från `apps/api` är `../../packages/memory` rätt väg.

2. `transpilePackages: ["@v1/memory"]`  
   “Vercel/Next, översätt den mappen också när du bygger. Hoppa inte över den.”

3. `createMemoryApi(createSupabaseStore(supabase))`  
   “Koppla hjärnan till den inloggade databas-klienten.”  
   Sen: `api.saveMemory(userId, input)` i stället för `saveMemory(supabase, input)`.

Första argumentet är personen, inte databas-sladden. Claude skickar aldrig personen. Alfredo tar den från inloggningen.

Sedan raderar han den gamla mappen så det bara finns en hjärna.

Om preview säger att `@v1/memory` saknas är det hans bygge, inte att dina regler är trasiga.

---

## 13. Vad Filip måste veta (inte du)

Han bygger skärmen. Han skall inte kopiera sökreglerna.

Han anropar HTTP. En lista från `GET /api/memories` är en **lista**. Inloggningssvaret är ett objekt med `data` inuti. Om han läser listan som om den vore inloggningen blir skärmen tom även när hjärnan är grön.

Samma `id` Claude fick skall synas hos honom. Konto B skall inte se konto A. Hans gren hade 12 september mest dokument, ingen app. Då underkänns dashboard-testerna som **hans** yta.

Alfredos testsida `/` är inte dashboarden. Den visar det råa ordet `deadline`, inte den svenska etiketten.

---

## 14. Claude-instruktionerna

Filen [claude-instruktioner.md](claude-instruktioner.md) har ett block mellan kodstaket. Det blocket skall klistras **exakt** i Claude-projektet. Inte omskrivet. Inte sammanfattat.

Det blocket är med flit långt. Claude är den största risken. Den kan:

- spara utan att söka
- hitta på ett `id`
- skicka `Deadline` i stället för `deadline`
- säga “sparat” när kuvertet hade `error`
- skriva `Projekt a` och sen tro att inget finns

Instruktionerna säger när den skall söka, spara och uppdatera. De säger att tom träff är okej. De säger att identisk omsparning är lycka om den ändå sparar samma text två gånger.

Du äger att texten stämmer med verktygsnamnen. Alfredo äger sladden. Ändra inte blocket på egen hand utan att säga till.

---

## 15. Måndag 14 september

Inte torsdag 17. Vissa äldre sidor säger 17. Repo och beslut säger 14.

Ordning in i `integration/v1`:

1. Alfredo
2. Melker
3. Filip

Inte `main`.

Din del under testdagen:

- Se till att blocket är inklistrat i Claude.
- Kör de tester i [torsdag-test.md](torsdag-test.md) som är märkta Melker eller alla.
- Om preview saknar paketet: Alfredos yta.
- Om skärmen saknas: Filips yta.
- Om Claude ljuger om “sparat”: instruktioner eller sladd. Kolla kuvertet först.

---

## 16. Vad du själv skall göra, och inte göra

**Skall**

- Kunna förklara lapparna, kuvertet och de tre verktygen.
- Klistra in Claude-blocket.
- Köra pakettesterna om du vill visa att hjärnan är grön.
- Merga `melker/memory` till `integration/v1` **efter** Alfredo sagt att preview hittar paketet.
- Skicka importlistan till Alfredo (mailutkastet ni redan har).

**Skall inte**

- Skriva i `apps/api/` eller dashboard-mappen.
- Ändra `docs/contracts.md`.
- Lägga lösen i git, Confluence eller PR.
- Merga PR #13.
- Pusha till `main`.
- Förvänta dig att kunna TypeScript. Du äger reglerna och instruktionerna, inte att skriva Next.js.

---

## 17. En mening du kan säga till andra

“Jag har byggt hjärnan som ett paket. Den validerar, sparar, söker och uppdaterar minnen. Claude och dashboarden skall anropa samma funktioner. Alfredo kopplar in paketet i servern. Filip visar raderna. På måndag sätter vi ihop det på `integration/v1`, inte på `main`.”

---

## 18. Var du läser vidare

Läs i den här ordningen om du vill gå djupare utan att lära dig språket:

1. Den här filen (du är här)
2. [testexempel.md](testexempel.md) — de tre lapparna
3. [claude-instruktioner.md](claude-instruktioner.md) — klistra in blocket
4. [torsdag-test.md](torsdag-test.md) — testdagen
5. [packages/memory/README.md](../packages/memory/README.md) — kort sedel till Alfredo
6. [contracts.md](contracts.md) — låst form, bara läs
7. [integration-v1.md](integration-v1.md) — mergeordning

Öppna inte `src/*.ts` för att lära dig programmera. Öppna dem bara om någon ber dig peka på en fil. Då räcker det att säga: “vakten är `validate.ts`, reglerna är `store.ts`, testerna ligger i `test/`.”
