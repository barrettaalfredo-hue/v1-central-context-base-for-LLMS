"use server";

import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { randomToken } from "@/lib/oauth/crypto";
import { getClient, redirectAllowed, saveCode } from "@/lib/oauth/store";

export async function approveMcpAccess(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const redirectUri = String(formData.get("redirect_uri") ?? "");
  const state = String(formData.get("state") ?? "");
  const codeChallenge = String(formData.get("code_challenge") ?? "");
  const method = String(formData.get("code_challenge_method") ?? "S256");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const back = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: method,
  });

  if (method !== "S256" || !clientId || !redirectUri || !codeChallenge) {
    back.set("error", "invalid");
    redirect(`/oauth/authorize?${back.toString()}`);
  }

  const client = await getClient(clientId);
  if (!client || !redirectAllowed(client, redirectUri)) {
    back.set("error", "client");
    redirect(`/oauth/authorize?${back.toString()}`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    back.set("error", "config");
    redirect(`/oauth/authorize?${back.toString()}`);
  }

  const supabase = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    back.set("error", "credentials");
    redirect(`/oauth/authorize?${back.toString()}`);
  }

  const code = randomToken();
  await saveCode({
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user_id: data.user.id,
  });

  const next = new URL(redirectUri);
  next.searchParams.set("code", code);
  if (state) next.searchParams.set("state", state);
  redirect(next.toString());
}
