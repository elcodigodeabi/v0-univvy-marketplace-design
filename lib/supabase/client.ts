import { createBrowserClient } from '@supabase/ssr'

// Singleton client instance - prevents multiple GoTrueClient instances
let supabaseClientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (typeof window === 'undefined') {
    // Server-side: create a new instance each time
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  // Client-side: reuse the same instance
  if (!supabaseClientInstance) {
    supabaseClientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }

  return supabaseClientInstance
}
