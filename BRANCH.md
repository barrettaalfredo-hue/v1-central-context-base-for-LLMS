# Branch `alfredo/integrations`

**Ägare:** Alfredo. Pusha bara här.

## Läge 11 september 2026

**Klart:** Stockholm-Supabase, tre konton, RLS, Vercel, Next.js-API för login + minnen. Deployat.

**Funkar:** Filips dashboard kan anropa `/api/auth/*` och `/api/memories*` enligt [docs/contracts.md](docs/contracts.md). Preview: https://v1-central-context-base-for-llms-ky7122wyi.vercel.app — `/` är bara testsida, inte dashboarden.

**Kvar här:** Alfredo klickar Claude-connector + stänger Vercel Login på den URL Claude använder. Melkers `packages/memory` inkopplas när den finns. Steg: [docs/oauth-mcp-alfredos-steg.md](docs/oauth-mcp-alfredos-steg.md). Filip: [docs/filip-auth.md](docs/filip-auth.md).

Full status längst upp i [README.md](README.md). Leverans: [apps/api/README.md](apps/api/README.md). Setup: [docs/supabase-setup.md](docs/supabase-setup.md).

**Inte `main`:** torsdag mergas den här grenen **först** in i **`integration/v1`**. Tester: [docs/torsdag-test.md](docs/torsdag-test.md).
