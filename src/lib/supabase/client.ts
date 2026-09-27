"use client";

// Browser-side Supabase client. Safe to use in client components —
// only ever uses the public anon key, which relies on Row Level
// Security policies (see supabase/schema.sql) to control access.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
