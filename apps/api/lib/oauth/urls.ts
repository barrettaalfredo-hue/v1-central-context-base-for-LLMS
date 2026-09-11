import { getPublicOrigin } from "mcp-handler";

export function publicOrigin(request: Request) {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (env) return env;
  return getPublicOrigin(request);
}

export function mcpResourceUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/mcp`;
}
