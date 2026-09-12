# Filip: koppla dashboard-vyerna till Alfredos auth

Gäller från **måndag 14 september** när `alfredo/integrations` mergas in i `integration/v1`. Samma JSON som [contracts.md](contracts.md). Cookies måste följa med (`credentials: "include"`).

Base URL: Vercel-preview för `alfredo/integrations` (Root Directory `apps/api`).

| Vy | Anrop |
| --- | --- |
| Inloggningsformulär | `POST /api/auth/login` body `{ "email", "password" }` |
| App-skal / “är jag inloggad?” | `GET /api/auth/session` |
| Logga ut | `POST /api/auth/logout` |
| Minneslista / sök / filter | `GET /api/memories?project=&category=&query=&offset=` |
| (senare, om UI ska spara) | `POST /api/memories` / `PATCH /api/memories/:id` |

Lyckad login: `{ "data": { "id", "email" } }`  
Fel lösen: `{ "error": { "code": "INVALID_CREDENTIALS", "message": "Fel mejl eller lösenord." } }`  
Inte inloggad: `{ "data": null }`

OAuth-godkännandevyn för Claude är `/oauth/authorize`. Alfredo äger auth bakom. Filip får byta utseendet på den sidan, inte flödet.
