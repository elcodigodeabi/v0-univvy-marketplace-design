import "server-only"
import { createClient } from "@/lib/supabase/server"

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
}

/**
 * Verifies the current session belongs to a user with role = 'administrador'.
 * Returns the admin user on success, or null if unauthenticated/unauthorized.
 * Use in Server Components (app/admin/layout.tsx) and Route Handlers alike.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "administrador") return null

  return { id: profile.id, email: profile.email, full_name: profile.full_name }
}
