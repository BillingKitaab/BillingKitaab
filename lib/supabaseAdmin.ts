import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service role key.
 * This bypasses all RLS policies.
 * NEVER import this in client-side "use client" components.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
