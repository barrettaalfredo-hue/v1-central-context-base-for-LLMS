import assert from "node:assert/strict";
import { test } from "node:test";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

test("supabase helpers return non-empty config", () => {
  assert.ok(getSupabaseUrl().length > 8);
  assert.ok(getSupabaseAnonKey().length > 20);
});
