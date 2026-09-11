import { getPublicOrigin } from "mcp-handler";

export function publicOrigin(request: Request) {
  // Always follow the host Claude actually called. NEXT_PUBLIC_APP_URL pointing at
  // the empty production alias (*.vercel.app without preview id) caused 404 on /oauth/authorize.
  const fromRequest = getPublicOrigin(request).replace(/\/$/, "");
  if (fromRequest && !fromRequest.includes("localhost")) {
    return fromRequest;
  }
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || fromRequest;
}

export function mcpResourceUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/mcp`;
}
