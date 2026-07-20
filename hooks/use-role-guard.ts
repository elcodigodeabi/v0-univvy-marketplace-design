"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

/**
 * Guards a page so only users with `requiredRole` can see it.
 * Anyone with a different role is redirected to their own dashboard.
 * Returns `{ authorized, checking }`:
 * - While `checking` is true, render a loading state (prevents flash of wrong UI).
 * - Only render the page content when `authorized` is true.
 */
export function useRoleGuard(requiredRole: "alumno" | "asesor") {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      // Wait for auth to resolve
      if (authLoading) return

      if (!user?.id) {
        router.replace("/login")
        return
      }

      const supabase = createClient()
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (cancelled) return

      const role = profile?.role || "alumno"

      if (role !== requiredRole) {
        // Redirect to the dashboard that matches the user's real role.
        // replace() (not push) so the invalid page isn't kept in history,
        // preventing back-button loops into the wrong role's screens.
        router.replace(role === "asesor" ? "/dashboard-asesor" : "/dashboard")
        return
      }

      setAuthorized(true)
      setChecking(false)
    }

    check()
    return () => {
      cancelled = true
    }
  }, [user?.id, authLoading, requiredRole, router])

  return { authorized, checking }
}
