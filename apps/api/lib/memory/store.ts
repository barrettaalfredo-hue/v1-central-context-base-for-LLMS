import type { SupabaseClient } from "@supabase/supabase-js";
import type { MemoryInput, MemoryRecord, SearchInput } from "./types";
import { fail, validateMemoryId, validateMemoryInput, validateSearchInput } from "./validate";

const MEMORY_COLUMNS =
  "id, project, category, title, content, created_at, updated_at" as const;

function toIso(value: string) {
  return new Date(value).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function asMemory(row: MemoryRecord): MemoryRecord {
  return {
    id: row.id,
    project: row.project,
    category: row.category,
    title: row.title,
    content: row.content,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  };
}

export async function saveMemory(supabase: SupabaseClient, input: MemoryInput) {
  const parsed = validateMemoryInput(input);
  if ("error" in parsed) return parsed;

  const insert = await supabase
    .from("memories")
    .insert(parsed.data)
    .select(MEMORY_COLUMNS)
    .single();

  if (!insert.error && insert.data) {
    return { data: asMemory(insert.data as MemoryRecord) };
  }

  if (insert.error?.code === "23505") {
    const existing = await supabase
      .from("memories")
      .select(MEMORY_COLUMNS)
      .eq("project", parsed.data.project)
      .eq("category", parsed.data.category)
      .eq("title", parsed.data.title)
      .eq("content", parsed.data.content)
      .maybeSingle();

    if (existing.data) {
      return { data: asMemory(existing.data as MemoryRecord) };
    }
  }

  return fail("SAVE_FAILED", "Kunde inte spara minnet.");
}

export async function searchMemory(supabase: SupabaseClient, input: SearchInput) {
  const parsed = validateSearchInput(input);
  if ("error" in parsed) return parsed;

  let query = supabase
    .from("memories")
    .select(MEMORY_COLUMNS)
    .order("updated_at", { ascending: false });

  if (parsed.data.project) {
    query = query.eq("project", parsed.data.project);
  }
  if (parsed.data.category) {
    query = query.eq("category", parsed.data.category);
  }
  if (parsed.data.query) {
    const q = parsed.data.query.replace(/[%_,()]/g, " ").trim();
    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }
  }

  const from = parsed.data.offset;
  const result = await query.range(from, from + 49);

  if (result.error) {
    return fail("SEARCH_FAILED", "Kunde inte söka minnen.");
  }

  return { data: ((result.data ?? []) as MemoryRecord[]).map(asMemory) };
}

export async function updateMemory(
  supabase: SupabaseClient,
  input: MemoryInput & { id: string },
) {
  const idCheck = validateMemoryId(input.id);
  if ("error" in idCheck) return idCheck;

  const parsed = validateMemoryInput(input);
  if ("error" in parsed) return parsed;

  const result = await supabase
    .from("memories")
    .update(parsed.data)
    .eq("id", idCheck.data)
    .select(MEMORY_COLUMNS)
    .maybeSingle();

  if (result.error) {
    return fail("UPDATE_FAILED", "Kunde inte uppdatera minnet.");
  }
  if (!result.data) {
    return fail("NOT_FOUND", "Minnet finns inte eller tillhör ett annat konto.");
  }

  return { data: asMemory(result.data as MemoryRecord) };
}
