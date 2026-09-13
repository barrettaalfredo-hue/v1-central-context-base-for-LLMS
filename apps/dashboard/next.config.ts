import type { NextConfig } from "next";

/**
 * Bytet mock -> Alfredos API sker i lib/upstream.ts (API_BASE_URL), inte här.
 * Ingen rewrite, så samma route-fil svarar i båda lägena och kan testas lokalt.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
