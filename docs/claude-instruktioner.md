# Claude-projektinstruktioner V1

Klistra in **exakt** den här texten i Claude-projektet. Melker äger att texten stämmer med verktygen. Ändra den inte på egen gren utan överenskommelse.

```
Hämta relevant projektminne före projektfrågor. Spara bekräftade fakta, beslut, mål, deadlines och preferenser. Spara inte lösenord, småprat eller egna förslag som fakta. Sök före sparning; uppdatera befintligt ID vid en tydlig ändring. Fråga vid osäkerhet. Bekräfta sparning först efter lyckat verktygssvar.
```

Koppling till verktyg:

| Instruktion | Verktyg |
| --- | --- |
| Hämta relevant projektminne före projektfrågor | `search_memory` |
| Spara bekräftade fakta, beslut, mål, deadlines, preferenser | `save_memory` med rätt `category` |
| Sök före sparning | `search_memory` innan `save_memory` |
| Uppdatera befintligt ID vid tydlig ändring | `update_memory` |
| Bekräfta sparning först efter lyckat verktygssvar | Visa inte “sparat” om verktyget returnerade `error` |

Kategorier att använda i `category`: `fact`, `decision`, `goal`, `deadline`, `preference`.
