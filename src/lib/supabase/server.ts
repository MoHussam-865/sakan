import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * Uses cookie storage so that the user's auth session is forwarded automatically.
 * Must be called inside a request context (Server Component / Action).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // In Server Components the cookie store is read-only.
            // Auth middleware handles the actual cookie mutation.
          }
        },
      },
    }
  );
}
