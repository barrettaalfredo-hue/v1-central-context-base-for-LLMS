"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { session } from "@/lib/api";
import type { SessionUser } from "@/lib/types";

/**
 * Hämtar sessionen. `{ data: null }` = inte inloggad -> tillbaka till "/".
 * Nätverksfel visas som text i stället för att kasta ut användaren.
 */
export function useSession() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await session();
      if (cancelled) return;
      if ("error" in result) {
        setError(result.error.message);
        setUser(null);
        return;
      }
      if (result.data === null) {
        router.replace("/");
        return;
      }
      setUser(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { user, error };
}
