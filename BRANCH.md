# Branch `alfredo/integrations`

**Ägare:** Alfredo. Pusha bara här.

Du äger **`apps/api/`** (Next.js-serverfunktioner, fjärr-MCP, Supabase Auth/DB i Stockholm). Exakt vad som ska vara klart står i [apps/api/README.md](apps/api/README.md). Missa inte: tre förskapade konton, inloggnings-JSON, RLS, `save_memory` / `search_memory` / `update_memory`, OAuth för MCP, fel som aldrig ser ut som lycka.

Självständigt: förutbestämda minnessvar i [docs/testexempel.md](docs/testexempel.md)-form medan Auth, DB och MCP byggs. Format: [docs/contracts.md](docs/contracts.md).

**Inte `main`:** torsdag mergas den här grenen **först** in i **`integration/v1`**. Tester: [docs/torsdag-test.md](docs/torsdag-test.md).
