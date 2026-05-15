"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Get advisor statistics for dashboard
export async function getAdvisorStats(advisorId: string) {
  const supabase = await createClient()

  try {
    // Get all bookings for this advisor
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("advisor_id", advisorId)

    if (bookingsError) throw bookingsError

    // Calculate stats from bookings
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const thisMonthBookings = bookings.filter(
      (b) => new Date(b.scheduled_at) >= thisMonth && b.status === "completed"
    )

    // Earnings this month (convert from cents to euros)
    const ganancias_mes = thisMonthBookings.reduce((sum, b) => sum + (b.advisor_amount || 0), 0) / 100

    // Total completed sessions
    const totalCompletedSessions = bookings.filter((b) => b.status === "completed").length

    // Unique active students (with confirmed bookings)
    const activeBookings = bookings.filter((b) => b.status === "confirmed")
    const uniqueStudents = new Set(activeBookings.map((b) => b.student_id))
    const estudiantes_activos = uniqueStudents.size

    // Acceptance rate
    const totalRequests = bookings.length
    const accepted = bookings.filter((b) => b.status !== "rejected").length
    const tasa_aceptacion = totalRequests > 0 ? Math.round((accepted / totalRequests) * 100) : 0

    return {
      success: true,
      data: {
        ganancias_mes,
        totalCompletedSessions,
        estudiantes_activos,
        tasa_aceptacion,
        totalBookings: totalRequests,
      },
    }
  } catch (error) {
    console.error("[v0] getAdvisorStats error:", error)
    return {
      success: false,
      error: "Error al cargar estadísticas",
    }
  }
}

// Get advisor sessions with optional filtering
export async function getAdvisorSessions(
  advisorId: string,
  status?: "confirmed" | "completed" | "pending_payment" | "rejected"
) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("bookings")
      .select(
        `
        id,
        student_id,
        student_name,
        title,
        subject,
        notes,
        scheduled_at,
        duration_minutes,
        modalidad,
        status,
        price,
        advisor_amount,
        created_at
      `
      )
      .eq("advisor_id", advisorId)
      .order("scheduled_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data: sessions, error } = await query

    if (error) throw error

    return {
      success: true,
      data: sessions || [],
    }
  } catch (error) {
    console.error("[v0] getAdvisorSessions error:", error)
    return {
      success: false,
      error: "Error al cargar sesiones",
      data: [],
    }
  }
}

// Get advisor profile and availability
export async function getAdvisorProfile(advisorId: string) {
  const supabase = await createClient()

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        email,
        avatar_url,
        bio,
        university,
        specialties,
        price_per_hour,
        availability
      `
      )
      .eq("id", advisorId)
      .eq("role", "advisor")
      .single()

    if (error) throw error

    return {
      success: true,
      data: profile,
    }
  } catch (error) {
    console.error("[v0] getAdvisorProfile error:", error)
    return {
      success: false,
      error: "Error al cargar perfil",
    }
  }
}

// Update advisor availability
export async function updateAdvisorAvailability(
  advisorId: string,
  availability: Record<string, Array<{ start: string; end: string }>>
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user || user.id !== advisorId) {
    return {
      success: false,
      error: "No autorizado",
    }
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        availability,
        updated_at: new Date().toISOString(),
      })
      .eq("id", advisorId)

    if (error) throw error

    revalidatePath("/calendario-asesor")
    return {
      success: true,
      message: "Disponibilidad actualizada",
    }
  } catch (error) {
    console.error("[v0] updateAdvisorAvailability error:", error)
    return {
      success: false,
      error: "Error al actualizar disponibilidad",
    }
  }
}

// Get pending booking requests for advisor
export async function getAdvisorPendingRequests(advisorId: string) {
  const supabase = await createClient()

  try {
    const { data: requests, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        student_id,
        student_name,
        subject,
        notes,
        scheduled_at,
        duration_minutes,
        modalidad,
        status,
        created_at
      `
      )
      .eq("advisor_id", advisorId)
      .eq("status", "pending_payment")
      .order("created_at", { ascending: false })

    if (error) throw error

    return {
      success: true,
      data: requests || [],
    }
  } catch (error) {
    console.error("[v0] getAdvisorPendingRequests error:", error)
    return {
      success: false,
      error: "Error al cargar solicitudes",
      data: [],
    }
  }
}
