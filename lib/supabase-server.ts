import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://dqepdoimpqhmuhkklxva.supabase.co";

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-only client. The service-role key bypasses RLS and is NEVER shipped
// to the browser — all prospect reads happen in Server Components / route
// handlers. When the key is absent the app falls back to bundled data.
let client: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!serviceKey) return null;
  if (!client) {
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const isSupabaseConfigured = Boolean(serviceKey);
