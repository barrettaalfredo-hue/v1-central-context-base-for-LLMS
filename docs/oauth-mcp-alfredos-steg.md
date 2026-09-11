# Dina klick: Claude fjärr-MCP (Alfredo)

Koden för MCP + OAuth finns på den här grenens PR. Det här kan inte agenten klicka åt dig.

## 1. Vercel

1. `SUPABASE_SERVICE_ROLE_KEY` behövs **inte** längre för Claude-OAuth (koden sparas via inloggat konto).
2. **Använd inte** `https://v1-central-context-base-for-llms.vercel.app` — det är tom `main` och ger 404.  
   MCP-URL är den **preview** Claude ska anropa (hash eller git-alias), just nu:  
   `https://v1-central-context-bas-git-838c5d-barrettaalfredo-hues-projects.vercel.app/api/mcp`  
   `NEXT_PUBLIC_APP_URL` behövs inte för OAuth-host (servern följer den host Claude anropar).
3. **Deployment Protection:** Standard Protection / Vercel Login **av** på den URL Claude ska använda. Claude kan inte logga in på Vercel-SSO.  
   Settings → Deployment Protection → av för Production (och för den preview ni testar, eller Bypass for Automation räcker **inte** för Claude Desktop).
4. Redeploy efter env-ändring.

Om Connect visar **Kunde inte godkänna åtkomst** utan “Fel mejl eller lösenord” var det servern, inte lösenordet. Uppdatera connectorn till senaste preview-URL och försök igen.

## 2. Merge och öppna MCP-adressen

MCP-URL att klistra in i Claude:

`https://<er-host>/api/mcp`

## 3. Claude Desktop

1. Settings → **Connectors** → Add custom connector (namnen kan skilja något mellan versioner).
2. URL: `https://<er-host>/api/mcp`
3. Claude öppnar `/oauth/authorize`. Logga in med ett **förskapat** konto och godkänn.
4. Klistra in instruktionerna från [claude-instruktioner.md](claude-instruktioner.md) i Claude-projektet.
5. Skriv t.ex. “Vi lanserar 15 oktober 2026 i Projekt A”. Claude ska anropa `save_memory`. Kontrollera raden via testsidan `/` inloggad som samma konto.

## 4. A/B-test (lösenord bara lokalt)

```bash
cd apps/api
ACCOUNT_A_EMAIL=... ACCOUNT_A_PASSWORD=... \
ACCOUNT_B_EMAIL=... ACCOUNT_B_PASSWORD=... \
BASE_URL=https://<er-host> \
node scripts/ab-test.mjs
```

OK-rad: `Konto B ser inte och kan inte uppdatera Konto A:s minne.`

Skicka inte lösenord i git eller chatt.
