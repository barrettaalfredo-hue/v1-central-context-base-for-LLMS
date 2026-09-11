import { metadataCorsOptionsRequestHandler, protectedResourceHandler } from "mcp-handler";
import { mcpResourceUrl, publicOrigin } from "@/lib/oauth/urls";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const origin = publicOrigin(request);
  const handler = protectedResourceHandler({
    authServerUrls: [origin],
    resourceUrl: mcpResourceUrl(origin),
  });
  return handler(request);
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
