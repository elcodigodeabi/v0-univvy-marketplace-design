"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  nombre: string
  tipo: "alumno" | "asesor"
  universidad: string
  carrera: string
  iniciales: string
  avatar?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Use auth metadata directly - profiles table may not exist yet
          setUser(mapSupabaseUser(authUser))
        } else {
          setUser(null)
        }
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Use auth metadata directly - profiles table may not exist yet
        setUser(mapSupabaseUser(session.user))
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

function mapSupabaseUser(authUser: User): AuthUser {
  const metadata = authUser.user_metadata || {}
  const nombre = metadata.nombre || authUser.email?.split("@")[0] || "Usuario"
  
  // Generate initials from name
  const nameParts = nombre.split(" ")
  const iniciales = nameParts.length >= 2
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    : nombre.substring(0, 2).toUpperCase()

  return {
    id: authUser.id,
    email: authUser.email || "",
    nombre,
    tipo: metadata.tipo || "alumno",
    universidad: metadata.universidad || "",
    carrera: metadata.carrera || "",
    iniciales,
    avatar: metadata.avatar,
  }
}

// Helper function to get user initials from name or email
export function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return "U"
  
  const parts = nameOrEmail.split(" ")
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  
  return nameOrEmail.substring(0, 2).toUpperCase()
}
