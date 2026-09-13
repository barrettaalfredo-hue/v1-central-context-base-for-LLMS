# Branch `integration/v1`

**Ägare:** alla tre. **Inte** daglig feature-kod.

Hit mergas `alfredo/integrations` → `melker/memory` → `filip/dashboard`. Här kör ni [docs/torsdag-test.md](docs/torsdag-test.md).

**Leverans på den här branchen:** tre appar mot samma Supabase och samma `packages/memory`. Mock och stub av. Alla fyra testerna i [docs/torsdag-test.md](docs/torsdag-test.md) ska vara gröna.

**`main` uppdateras först när testerna är godkända.** Hur ni mergar och vad som måste stämma: [docs/integration-v1.md](docs/integration-v1.md).
