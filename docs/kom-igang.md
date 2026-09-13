# Kom igång och testa V1

För Alfredo, Filip och Melker. 15–20 minuter. Ingen kod, ingen lokal server.

Ni testar **samma** sak: Claude sparar i molnet, dashboarden visar samma rad, ett annat konto ser den inte.

## Adresser

| Vad | Öppna |
| --- | --- |
| Dashboard | https://v1-central-context-base-for-llms-ausd5rwta.vercel.app |
| MCP till Claude | `https://v1-central-context-bas-git-7f4021-barrettaalfredo-hues-projects.vercel.app/api/mcp` |

Dashboard-länken är senaste previewen av `integration/v1`. Nyare finns i Vercel → projektet → Deployments → branchen `integration/v1`.

Öppna **inte** `https://v1-central-context-base-for-llms.vercel.app` — det är tom `main` (404).

## Konton

Ingen registrering. Använd **ditt** konto i både dashboard och Claude.

| Vem | E-post | Lösenord |
| --- | --- | --- |
| Filip | `filip.test@example.com` | `TestFilip#2026!` |
| Alfredo | `alfredo.test@example.com` | `TestAlfredo#2026!` |
| Melker | `melker.test@example.com` | `TestMelker#2026!` |

Projektnamnet i testet är alltid exakt **`Projekt A`**.

---

## 1. Dashboard (alla tre)

1. Öppna dashboard-länken.
2. Du ska se **Claude-minne** och **Logga in**. Inte en gul testsida.
3. Logga in med ditt konto.
4. Du hamnar på **Minnen**. Lista, sök och filter ska synas.
5. Klicka **Anslut Claude**.

Om inloggningen failar: fel mejl/lösen, eller du är på fel URL.

---

## 2. Koppla Claude Desktop (alla tre, eget konto)

1. I dashboarden på **Anslut Claude**: kopiera MCP-adressen.
2. Claude Desktop → **Settings → Connectors → Add custom connector**.
3. Klistra in adressen som fjärr-MCP (Remote MCP server). Spara.
4. Klicka **Connect**. Ett fönster öppnas.
5. Logga in med **samma** e-post och lösen som i dashboarden. Klicka godkänn.
6. Skapa ett Claude-projekt. På **Anslut Claude**: kopiera instruktionerna och klistra in dem **exakt** som projektinstruktion. Inte omskrivet.

Samma MCP-adress för alla. Ägaren blir den som loggar in i godkännandefönstret.

Har du en gammal anslutning som slutat fungera: ta bort den och gör stegen ovan igen.

---

## 3. Snabbtest (ca 5 minuter)

Gör detta i Claude, sedan kolla dashboarden inloggad som **samma** konto. Fliken Minnen uppdateras själv inom tio sekunder.

1. Skriv: `Kom ihåg att Projekt A ska lanseras den 15 oktober 2026.`
2. Öppna Minnen. En rad ska synas (deadline / Lanseringsdatum eller liknande).
3. Ny chatt i samma projekt: `När ska Projekt A lanseras?`
4. Claude ska svara 15 oktober utan att du skriver “hämta minne”.
5. Skriv: `Ändra lanseringen till 22 oktober 2026.`
6. Samma rad i dashboarden ska uppdateras. Ingen dubblett.

Om Claude inte anropar verktygen: man saknar projektinstruktionerna, eller anslutningen är inte Connect/godkänd.

---

## 4. Isolering (gör en gång, två personer)

1. Alfredo (eller Filip) sparar en rad via Claude, som i steg 3.
2. Den andra loggar in på dashboarden med **sitt** konto.
3. Listan ska **inte** innehålla den andras rad.
4. Den andra får inte kunna ändra den andras minne.

---

## Vem gör vad om något är fel

| Fel | Vem |
| --- | --- |
| Dashboard ser konstig ut, sök/filter, OAuth-rutan | Filip |
| Inloggning, Claude-koppling, 401, MCP-adress, Vercel | Alfredo |
| Fel category, dubbletter, sök missar, fel JSON | Melker |

Måndagens långa lista: [torsdag-test.md](torsdag-test.md). Den här filen räcker för att komma igång.

## Rör inte

- Inte `main` förrän måndagens tester är gröna.
- Inte Root Directory i Vercel (ska vara `apps/api`).
- Inte branchen `cursor/mcp-forever-d243` (där sitter MCP-adressen).
- Inte ett andra Vercel-projekt för dashboarden.
