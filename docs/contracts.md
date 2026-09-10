# Kontrakt V1 — fylls i tillsammans innan kod

Alla tre godkänner den här filen. Filip mockar den. Alfredo implementerar den. Melker speglar den i testdatabas och testkö. Byt inte fältnamn på egen gren.

Status: **OFYLLD — fylls i workshopen, se `docs/innan-kod.md`.**

## Minnesfält

| Fält | Typ | Krävs | Betydelse | V1-värde |
| --- | --- | --- | --- | --- |
| id | | ja | | |
| topic | | ja | ämne | |
| occurred_at | | ja | tid minnet gäller | |
| created_at | | ja | när det sparades | |
| source | | ja | vilken modell/klient | |
| version | | ja | | |
| status | | ja | t.ex. active / archived / conflict | |
| text | | ja | det faktiska minnet | |
| conversation_id | | ja | ursprung | |

## Konflikt

| Fält | Typ | Krävs | Betydelse | V1-värde |
| --- | --- | --- | --- | --- |
| id | | | | |
| memory_id_a | | | | |
| memory_id_b | | | | |
| reason | | | varför de motsäger varandra | |
| status | | | open / resolved | |

## Anslutning

| Fält | Typ | Krävs | Betydelse | V1-värde |
| --- | --- | --- | --- | --- |
| id | | | | |
| user_id | | | | |
| client | | | `claude-desktop` / `chatgpt-desktop` | |
| status | | | connected / disconnected / error | |

## Godkänt råsamtal (ingest)

| Fält | Typ | Krävs | Betydelse | V1-värde |
| --- | --- | --- | --- | --- |
| id | | | | |
| user_id | | | | |
| connection_id | | | | |
| approved_at | | | | |
| messages | | | råtext / lista | |

Modellen får **inte** själv välja att detta ska sparas. Endast godkända samtal.

## Kömeddelanden

| Event | När | Payload (fält) |
| --- | --- | --- |
| conversation.ingested | samtal godkänt och sparat | |
| memory.requested | ny fråga, hämta kontextpaket | |
| | | |

## Kontextpaket (det som LLM får innan svaret)

| Fält | Typ | Max | Betydelse |
| --- | --- | --- | --- |
| memories[] | | max ___ st | |
| each.text | | max ___ tecken | |
| each.topic | | | |
| each.occurred_at | | | |
| conflicts[] | | | öppna motsägelser som berör frågan |

Fråga in → detta paket ut. Inte hela databasen.

## Tabeller / RLS (Postgres eller valt namn i `docs/innan-kod.md`)

Lista tabeller och att varje rad är per `user_id`:

- users
- connections
- conversations
- memories
- conflicts
- (lägg till)

En användare ser inte en annans rader.

## Godkänt

| Person | Datum | Signatur |
| --- | --- | --- |
| Filip | | |
| Alfredo | | |
| Melker | | |
