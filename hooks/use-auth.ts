"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  nombre: string
  first_name: string
  last_name: string
  tipo: "alumno" | "asesor"
  universidad: string
  carrera: string
  iniciales: string
  avatar?: string
  avatar_url?: string
  phone?: string
  bio?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadUser(authUser: User) {
      // Always read the real name from profiles — auth metadata only has the
      // OAuth pseudonym (e.g. "spotifyvictoria") which is never what we want.
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, nombre, role, universidad, carrera, avatar_url, phone, descripcion")
        .eq("id", authUser.id)
        .single()

      setUser(mapSupabaseUser(authUser, profile))
    }

    // Get initial session
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          await loadUser(authUser)
        } else {
          setUser(null)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return { user, loading, signOut }
}

function mapSupabaseUser(
  authUser: User,
  profile: {
    full_name?: string
    nombre?: string
    role?: string
    universidad?: string
    carrera?: string
    avatar_url?: string
    phone?: string
    descripcion?: string
  } | null
): AuthUser {
  const metadata = authUser.user_metadata || {}

  // Prefer granular fields; fall back to splitting full_name, then metadata, then email prefix
  const first_name =
    (profile?.full_name?.trim().split(" ")[0]) ||
    (profile?.nombre?.trim().split(" ")[0]) ||
    (metadata.full_name as string | undefined)?.trim().split(" ")[0] ||
    authUser.email?.split("@")[0] ||
    ""

  const last_name =
    (profile?.full_name?.trim().split(" ").slice(1).join(" ")) ||
    (profile?.nombre?.trim().split(" ").slice(1).join(" ")) ||
    (metadata.full_name as string | undefined)?.trim().split(" ").slice(1).join(" ") ||
    ""

  const nombre = [first_name, last_name].filter(Boolean).join(" ") || "Usuario"

  const nameParts = nombre.split(" ").filter(Boolean)
  const iniciales =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : nombre.substring(0, 2).toUpperCase()

  const tipo: "alumno" | "asesor" =
    (profile?.role as "alumno" | "asesor") ||
    (metadata.tipo as "alumno" | "asesor") ||
    "alumno"

  return {
    id: authUser.id,
    email: authUser.email || "",
    nombre,
    first_name,
    last_name,
    tipo,
    universidad: profile?.universidad || (metadata.universidad as string) || "",
    carrera: profile?.carrera || (metadata.carrera as string) || "",
    iniciales,
    avatar: profile?.avatar_url || (metadata.avatar as string) || undefined,
    avatar_url: profile?.avatar_url || undefined,
    phone: profile?.phone || "",
    bio: profile?.descripcion || "",
  }
}

// Helper function to get user initials from name or email
export function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return "U"
  const parts = nameOrEmail.split(" ").filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return nameOrEmail.substring(0, 2).toUpperCase()
}
