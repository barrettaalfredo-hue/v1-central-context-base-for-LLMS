/**
 * Tre förskapade mock-konton. Ingen registrering.
 * Lösenordet är samma för alla och sätts med MOCK_PASSWORD (default "mock-losen").
 * De riktiga testkontona ägs av Alfredo och skrivs inte in här.
 */
export type MockAccount = { id: string; email: string };

export const MOCK_ACCOUNTS: MockAccount[] = [
  { id: "11111111-1111-4111-8111-111111111111", email: "filip@example.com" },
  { id: "22222222-2222-4222-8222-222222222222", email: "alfredo@example.com" },
  { id: "33333333-3333-4333-8333-333333333333", email: "melker@example.com" },
];

export function mockPassword(): string {
  return process.env.MOCK_PASSWORD || "mock-losen";
}

export function findAccount(email: string, password: string): MockAccount | null {
  const wanted = email.trim().toLowerCase();
  const account = MOCK_ACCOUNTS.find((a) => a.email === wanted);
  if (!account || password !== mockPassword()) return null;
  return account;
}

export function accountById(id: string): MockAccount | null {
  return MOCK_ACCOUNTS.find((a) => a.id === id) ?? null;
}
