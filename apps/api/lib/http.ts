import { NextResponse } from "next/server";

const NO_STORE = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
};

export function jsonOk(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function jsonError(code: string, message: string, status = 400) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: NO_STORE },
  );
}
