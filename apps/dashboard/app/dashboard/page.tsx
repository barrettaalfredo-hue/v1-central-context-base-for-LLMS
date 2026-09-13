"use client";

import { MemoryList } from "@/components/MemoryList";
import { TopBar } from "@/components/TopBar";
import { ErrorText } from "@/components/ui";
import { useSession } from "@/components/useSession";

export default function DashboardPage() {
  const { user, error } = useSession();

  if (user === undefined) {
    return <main className="p-6 text-sm text-muted">Kontrollerar inloggning…</main>;
  }
  if (!user) {
    return (
      <main className="mx-auto w-full max-w-md p-6">
        <ErrorText message={error ?? "Ogiltig session. Logga in igen."} />
      </main>
    );
  }

  return (
    <>
      <TopBar email={user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold">Dina minnen</h1>
        <MemoryList />
      </main>
    </>
  );
}
