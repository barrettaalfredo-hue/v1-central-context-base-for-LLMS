import type { NextConfig } from "next";

/**
 * API_BASE_URL tom  -> dashboardens egna mock-routes under /api svarar (fristående läge).
 * API_BASE_URL satt -> alla /api/* skickas vidare till Alfredos API (måndagsläget).
 *
 * Rewriten sker på servern, så webbläsaren pratar alltid med samma origin.
 * Alfredos Set-Cookie följer med tillbaka och sätts på dashboardens domän.
 */
const apiBase = (process.env.API_BASE_URL ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    if (!apiBase) return { beforeFiles: [], afterFiles: [], fallback: [] };
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${apiBase}/api/:path*` }],
      afterFiles: [],
      fallback: [],
    };
  },
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
