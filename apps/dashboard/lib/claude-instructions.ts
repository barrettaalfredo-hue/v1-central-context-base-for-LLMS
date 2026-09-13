/**
 * EXAKT texten i docs/claude-instruktioner.md. Melker äger att den stämmer med verktygen.
 * Ändra inte här utan att docs-filen ändras först.
 */
export const CLAUDE_INSTRUCTIONS =
  "Hämta relevant projektminne före projektfrågor. Spara bekräftade fakta, beslut, mål, deadlines och preferenser. Spara inte lösenord, småprat eller egna förslag som fakta. Sök före sparning; uppdatera befintligt ID vid en tydlig ändring. Fråga vid osäkerhet. Bekräfta sparning först efter lyckat verktygssvar.";

/** MCP-adressen som ska klistras in i Claude. Sätts med NEXT_PUBLIC_MCP_URL. */
export function mcpUrl(): string {
  return process.env.NEXT_PUBLIC_MCP_URL || "";
}
