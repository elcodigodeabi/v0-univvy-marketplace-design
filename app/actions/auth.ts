"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signUp(formData: {
  email: string
  password: string
  nombre: string
  tipo: "alumno" | "asesor"
  universidad: string
  carrera: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/callback`,
      data: {
        nombre: formData.nombre,
        tipo: formData.tipo,
        universidad: formData.universidad,
        carrera: formData.carrera,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { data, needsEmailConfirmation: true }
}

export async function signIn(formData: { email: string; password: string }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return { error: "Por favor, confirma tu correo electrónico antes de iniciar sesión." }
    }
    return { error: error.message }
  }

  // Redirect based on user role
  const userType = data.user?.user_metadata?.tipo || "alumno"
  
  if (userType === "asesor") {
    redirect("/dashboard-asesor")
  } else {
    redirect("/dashboard")
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function resendVerificationEmail(email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
