/** Public Stockholm project. Same values as the browser anon key — not service_role. */
const FALLBACK_URL = "https://uthkzkvpkkpzrmzjunqq.supabase.co";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aGt6a3Zwa2twenJtemp1bnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTE4ODgsImV4cCI6MjEwNDY2Nzg4OH0.uTGwNTNLMbxAsFYg9SvfoSkb6smPo8T6cEQszeTxTNM";

function readEnv(name: string) {
  const value = process.env[name]?.trim() || "";
  if (!value || value === "[REDACTED]") return "";
  return value;
}

export function getSupabaseUrl() {
  const fromEnv = readEnv("SUPABASE_URL") || readEnv("NEXT_PUBLIC_SUPABASE_URL");
  if (fromEnv.includes("uthkzkvpkkpzrmzjunqq")) return fromEnv.replace(/\/$/, "");
  return FALLBACK_URL;
}

export function getSupabaseAnonKey() {
  const fromEnv =
    readEnv("SUPABASE_ANON_KEY") ||
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("SUPABASE_PUBLISHABLE_KEY");
  if (fromEnv.startsWith("eyJ") || fromEnv.startsWith("sb_")) return fromEnv;
  return FALLBACK_ANON_KEY;
}

export function getSupabaseServiceRoleKey() {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function supabaseEnvSource() {
  const urlFromEnv = Boolean(readEnv("SUPABASE_URL") || readEnv("NEXT_PUBLIC_SUPABASE_URL"));
  const keyFromEnv = Boolean(
    readEnv("SUPABASE_ANON_KEY") ||
      readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
      readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
      readEnv("SUPABASE_PUBLISHABLE_KEY"),
  );
  return urlFromEnv && keyFromEnv ? "env" : "fallback";
}
