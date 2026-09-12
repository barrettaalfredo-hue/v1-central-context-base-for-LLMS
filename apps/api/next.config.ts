import path from "node:path";
import type { NextConfig } from "next";

const repoRoot = path.join(process.cwd(), "..", "..");

const nextConfig: NextConfig = {
  transpilePackages: ["@v1/memory"],
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot,
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
