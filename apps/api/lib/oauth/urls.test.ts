import assert from "node:assert/strict";
import { test } from "node:test";
import { publicOrigin } from "./urls";

function requestWithHost(host: string) {
  return new Request(`https://${host}/.well-known/oauth-authorization-server`, {
    headers: {
      "x-forwarded-host": host,
      "x-forwarded-proto": "https",
    },
  });
}

test("OAuth issuer follows the host Claude called, not NEXT_PUBLIC_APP_URL", () => {
  const previous = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "https://v1-central-context-base-for-llms.vercel.app";
  try {
    const origin = publicOrigin(
      requestWithHost("v1-central-context-base-for-llms-ntt7950tl.vercel.app"),
    );
    assert.equal(origin, "https://v1-central-context-base-for-llms-ntt7950tl.vercel.app");
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = previous;
  }
});

test("localhost still uses NEXT_PUBLIC_APP_URL when set", () => {
  const previous = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "https://preview.example";
  try {
    const origin = publicOrigin(requestWithHost("localhost:3000"));
    assert.equal(origin, "https://preview.example");
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = previous;
  }
});
