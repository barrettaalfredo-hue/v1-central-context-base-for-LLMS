import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

function findRepoRoot(start = process.cwd()) {
  let dir = start;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, "packages/memory/src/index.ts"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`packages/memory saknas från ${start}`);
}

const repoRoot = findRepoRoot();

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
