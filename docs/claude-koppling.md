# Hur Claude kopplas — och hur tre personer håller det synkat

Läs det här **innan** ni fyller resten av `docs/innan-kod.md`. Claude-kopplingen är pipan. Resten av planen hänger på den.

## Den sanning ni måste acceptera för V1

Claude Desktop kan **inte** läsa frågan bakom ryggen på Claude och skjuta in minne innan modellen tänker.

Det som faktiskt händer:

```
Du skriver i Claude Desktop
        ↓
Claude ser frågan
        ↓
Claude anropar ert MCP-verktyg (om den väljer att göra det)
        ↓
Er server svarar med ett kort kontextpaket
        ↓
Claude svarar dig
```

Er vision (“Claude ska inte själv börja söka”) går **inte** att bygga inuti Claude Desktop i V1. Det skulle kräva en egen chatt/proxy som sitter *framför* Claude — det är ett annat projekt.

**V1-beslutet:** vi accepterar att Claude anropar verktyget `get_context`. Vi gör det så svårt som möjligt för den att glömma: tydlig tool-beskrivning + en fast instruktion i Claude Desktop: “Anropa alltid get_context med användarens fråga innan du svarar.”

Utan det beslutet kan ni inte planera tre personer. Då bygger ni tre olika drömmar.

## Ni planerar inte tre produkter. Ni planerar två anrop.

Hela synken mellan Alfredo, Melker och Filip är **två funktioner** och ett JSON-svar. Inte mer.

```
1) Spara (in i minnet)
   save_conversation(godkänt samtal) → { conversation_id }

2) Hämta (ut till Claude)
   get_context(fråga, user_id)     → { memories[], conflicts[] }
```

JSON-formen på `memories[]` och `conflicts[]` är `docs/contracts.md`. Den filen **är** synken. Om den är ifylld kan tre personer bygga samtidigt utan att prata varje timme. Om den är tom synkar ingenting, oavsett brancher.

```
Claude Desktop
      │  MCP (Alfredo äger den här sladden)
      ▼
  MCP-server  ──save_conversation──►  DB + kö  ──► Melkers worker
      │
      └──get_context(fråga) ──────►  Melker returnerar paket
                                      │
                                      ▼
                               Filip visar samma
                               minnen i dashboarden
```

Filip pratar **aldrig** med Claude. Melker pratar **aldrig** med Claude. Bara Alfredo. De andra två pratar med **samma JSON** som MCP-servern använder.

## Så planerar tre personer utan att blockera varandra

Tänk tre ändar på samma sladd, inte tre planer.

| Person | Äger | Bygger mot | Behöver inte vänta på |
| --- | --- | --- | --- |
| **Alfredo** | Claude Desktop → MCP-server | De två anropen. Först med **låtsassvar** (hårdkodat paket i exakt JSON från kontraktet). | Melkers motor, Filips UI |
| **Melker** | `get_context` och extraktion på riktigt | Samma JSON. Testdatabas. Fråga in → paket ut. Samtal in → minnen ut. | Att Claude Desktop funkar |
| **Filip** | Dashboard som visar minnen/anslutning | Samma JSON. Mock som ser ut som paketet. “Ansluten” = MCP har hjärtslag. | Att Claude eller motorn kör |

Första gemensamma sanningen: **Alfredos låtsaspaket och Melkers riktiga paket är identiska fält.** Annars synkar det inte vid ihopkoppling.

Andra gemensamma sanningen: **Filips lista i UI visar samma fält som paketet.** Annars tror ni att dashboarden är “minnet” när den visar något annat.

## Vad ni tre gör tillsammans om Claude (30–45 min)

Inte en tvåveckorsplan. Bara kopplingen.

1. Acceptera V1-sanningen ovan (Claude anropar verktyget).
2. Lås de två anropen: `save_conversation` och `get_context`.
3. Fyll **bara** kontextpaketet + råsamtal i `docs/contracts.md` (resten av kontraktet kan ni ta direkt efter).
4. Skriv en mening som ska stå i Claude Desktop-instruktionen: *Anropa alltid get_context med min senaste fråga innan du svarar.*
5. Välj ett enda test: samma fråga, samma förväntade tre minnesrader, som Alfredo hårdkodar, Melker ska producera, Filip ska visa.

När punkt 5 är skriven på papper är ni synkade. Då kan ni gå isär och koda.

## Vad som *inte* är synk

- Tre brancher. Brancher hindrar bara fil-krockar. De synkar inte data.
- “Vi pratar imorgon.” Synk är ett ifyllt JSON-kontrakt, inte ett möte.
- Att vänta in varandras appar. Alfredo ska kunna visa Claude med låtsaspaket **innan** Melker är klar. Melker ska kunna testa paket **utan** Claude. Filip ska kunna klicka i UI **utan** båda.

## ChatGPT

Samma två anrop, annan sladd, senare. Planera inte ChatGPT förrän Claude-testet i punkt 5 funkar en gång. Annars planerar ni två osäkra sladdar samtidigt och inget synkar.
