# Innan kod — gör detta tillsammans

Filip, Alfredo och Melker sitter i **samma rum / samma call**. En person skriver, de andra två godkänner. **Ingen app-kod** förrän alla sju punkter har ett valt värde.

Tid: en workshop, ungefär en halv dag. Output: den här filen ifylld + `docs/contracts.md` ifylld. Committa till `main` (eller merga PR:n) **innan** någon pushar feature-kod.

## 1. Injektion — hur kommer context till LLM?

Problemet ni löser: användaren ska inte behöva be Claude att “söka i minnet”. Paketet ska ligga med **innan** svaret.

Välj **en** för V1:

| Alternativ | Vad det betyder | Välj |
| --- | --- | --- |
| A. Claude anropar alltid verktyget `get_context` | Enklare. MCP räcker. Svagare mot visionen (modellen “startar en sökning”). | [ ] |
| B. En gateway/proxy sätter på kontextpaketet innan anropet går till modellen | Matchar visionen. Alfredo äger gateway. Mer jobb. | [ ] |

**Beslut:** _________________  
**Ägare att bygga det:** _________________

Utan det här valet bygger Alfredo MCP som inte uppfyller produkten.

## 2. Vilken klient är V1?

| Klient | V1? | Kommentar |
| --- | --- | --- |
| Claude Desktop | [ ] ja  [ ] nej | MCP finns. Bevisa den här först. |
| ChatGPT Desktop | [ ] ja  [ ] V1.1 | Bekräfta vad appen **faktiskt** stöder innan ni lovar samma MCP-väg. |

Skriv vad ChatGPT Desktop tillåter idag (efter 20 min research tillsammans):

```
________________________________________________
```

## 3. Namnge tekniken som saknas i stacken

Fyll i **konkreta produkter**, inte roller.

| Behov | V1-val | Förbjudet att lämna tomt |
| --- | --- | --- |
| Databas (RLS) | _________________ t.ex. Postgres | Alfredo + Melker speglar samma schema |
| Kö | _________________ t.ex. Redis / Postgres `SKIP LOCKED` | Samma namn i API och worker |
| Relevans i V1 | [ ] bara ämne + tid  [ ] + embeddings: _________________ | “Relevans” utan val = hål |
| Extraktionsmodell | _________________ t.ex. vilken LLM + JSON-schema | Melker får inte hitta på en egen modell i tysthet |
| Auth-provider | _________________ t.ex. Google / GitHub / magic link | Filip mockar **samma** fält, bygger inte eget login-system |

## 4. Fyll `docs/contracts.md`

Tillsammans, fält för fält. Inte “vi tar det sen”.

Måste finnas innan ni går isär:

- användare
- anslutning (claude-desktop / chatgpt-desktop)
- godkänt råsamtal
- minne (ämne, tid, källa, version, status, text)
- konflikt
- kömeddelanden (`conversation.ingested`, `memory.requested`, …)
- kontextpaket (max längd, fält) — det som skickas till LLM

**Klart när:** Filip kan mocka API:t mot filen, Melker kan bygga testdatabas mot filen, Alfredo kan implementera utan att ändra fältnamn varje dag.

## 5. Auth-gräns

Ett system, inte två.

- Alfredo äger riktig inloggning.
- Filip visar samma statusfält i UI (inloggad / fel) mot mock som följer kontraktet.
- Ingen “Filip-auth” som sen kastas.

**Bekräftat av alla tre:** [ ] ja

## 6. Skriv demo-scriptet ni ska klara tillsammans

V1 är klar när den här kedjan funkar **en gång på riktigt**, inte när tre demos funkar var för sig:

1. Ett godkänt samtal skickas in (Claude Desktop eller testverktyg).
2. Det landar i gemensam DB + kö.
3. Motorn extraherar minst ett minne.
4. Dashboarden visar minnet (ämne + tid).
5. En ny fråga ger ett **kort** kontextpaket via den injektion ni valde i punkt 1.

Skriv det konkreta exempel-samtalet ni ska använda (samma för alla tre):

```
Projekt: ________________________________
Ett beslut: ______________________________
En deadline: _____________________________
En motsägelse: ___________________________
```

## 7. Boka ihopkoppling **i mitten**, inte bara i slutet

| När | Vad som ska sitta ihop | Datum |
| --- | --- | --- |
| Mitten av sprinten | Råsamtal i DB + minst ett minne från Melker mot samma schema | ________ |
| Senare | Filip läser riktiga minnen, mock av | ________ |
| Slut | Demo-scriptet i punkt 6, end-to-end | ________ |

Mergeordning när ni kopplar: Alfredo (schema/kö) → Melker (byt stub) → Filip (byt mock).

## Stopp-regel

Om en ruta ovan är tom: **skriv inte kod ännu.** Bygg inte Next.js-app, FastAPI eller worker mot gissningar.
