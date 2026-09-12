# Branch `melker/memory`

**Ägare:** Melker. Pusha bara här.

Du äger **`packages/memory/`** (TypeScript-hjärnan). Exakt vad som ska vara klart står i [packages/memory/README.md](packages/memory/README.md). Missa inte: validering, spara, uppdatera via id, sök (text + filter, senast uppdaterat först), simulerad lagring, tester mot [docs/testexempel.md](docs/testexempel.md), och Claude-instruktionerna.

Samma funktioner ska användas av både dashboard och MCP efter ihopkoppling. Ingen Python, worker, kö eller vektordb.

**Inte `main`:** måndag mergas den här grenen till **`integration/v1`** (efter Alfredo, före Filip). Tester: [docs/torsdag-test.md](docs/torsdag-test.md).
