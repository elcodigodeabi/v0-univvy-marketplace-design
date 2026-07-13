"use server"

import { createClient } from "@/lib/supabase/server"
import { createChatForBooking } from "@/app/actions/chat"
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
        universidad,
        carrera,
        especialidades,
        precio_por_hora,
        disponibilidad,
        rating,
        total_reviews,
        sesiones_completadas
      `
      )
      .eq("id", advisorId)
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
  availability: Record<string, { enabled: boolean; slots: Array<{ start: string; end: string }> }>
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  console.log("[v0] updateAdvisorAvailability called with:", { advisorId, userId: user?.id })

  if (authError || !user || user.id !== advisorId) {
    console.log("[v0] Auth error or user mismatch:", { authError: authError?.message, userId: user?.id, advisorId })
    return {
      success: false,
      error: "No autorizado",
    }
  }

  try {
    console.log("[v0] Attempting to update disponibilidad for:", advisorId)
    console.log("[v0] Availability data:", JSON.stringify(availability))
    
    const { data, error } = await supabase
      .from("profiles")
      .update({
        disponibilidad: availability,
        updated_at: new Date().toISOString(),
      })
      .eq("id", advisorId)
      .select()

    if (error) {
      console.error("[v0] Supabase update error:", error.message, error.code, error.details)
      
      // Check if it's a missing column error
      if (error.message.includes("disponibilidad") || error.message.includes("column") || error.code === "42703") {
        return {
          success: false,
          error: "La base de datos necesita actualizarse. Por favor, ejecuta el script de migración en Supabase: scripts/009_add_advisor_columns.sql",
        }
      }
      throw error
    }

    console.log("[v0] Update successful:", data)
    revalidatePath("/calendario-asesor")
    revalidatePath("/gestion-asesor")
    return {
      success: true,
      message: "Disponibilidad actualizada",
    }
  } catch (error: any) {
    console.error("[v0] updateAdvisorAvailability error:", error?.message || error)
    return {
      success: false,
      error: error?.message || "Error al actualizar disponibilidad",
    }
  }
}

// Update advisor profile (materias, precios, bio, etc.)
export async function updateAdvisorProfile(
  advisorId: string,
  data: {
    bio?: string
    especialidades?: string[]
    precio_por_hora?: number
    universidad?: string
    carrera?: string
  }
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
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", advisorId)

    if (error) throw error

    revalidatePath("/gestion-asesor")
    revalidatePath("/configuracion-asesor")
    revalidatePath(`/asesores/${advisorId}`)
    return {
      success: true,
      message: "Perfil actualizado",
    }
  } catch (error) {
    console.error("[v0] updateAdvisorProfile error:", error)
    return {
      success: false,
      error: "Error al actualizar perfil",
    }
  }
}

// Accept a booking request
export async function acceptBookingRequest(bookingId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: "No autorizado",
    }
  }

  try {
    // Verify the booking belongs to this advisor
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("advisor_id", user.id)
      .single()

    if (fetchError || !booking) {
      return {
        success: false,
        error: "Solicitud no encontrada",
      }
    }

    if (booking.status !== "pending_payment" && booking.status !== "pending_confirmation") {
      return {
        success: false,
        error: "Esta solicitud ya fue procesada",
      }
    }

    // Update booking status to confirmed
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    if (updateError) throw updateError

    // Create chat for this booking now that it's confirmed
    const chatResult = await createChatForBooking(bookingId)
    if (chatResult.error) {
      console.error("[v0] Error creating chat for booking:", chatResult.error)
      // Don't fail the entire request if chat creation fails, but log it
    }

    // Create notification for student
    await supabase.from("notifications").insert({
      user_id: booking.student_id,
      type: "booking_accepted",
      title: "Solicitud Aceptada",
      message: `Tu solicitud de asesoría ha sido aceptada. La sesión está confirmada.`,
      data: { booking_id: bookingId },
    })

    revalidatePath("/solicitudes-asesor")
    revalidatePath("/mis-sesiones-asesor")
    revalidatePath("/calendario-asesor")

    return {
      success: true,
      message: "Solicitud aceptada correctamente",
    }
  } catch (error) {
    console.error("[v0] acceptBookingRequest error:", error)
    return {
      success: false,
      error: "Error al aceptar la solicitud",
    }
  }
}

// Reject a booking request
export async function rejectBookingRequest(bookingId: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: "No autorizado",
    }
  }

  try {
    // Verify the booking belongs to this advisor
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("advisor_id", user.id)
      .single()

    if (fetchError || !booking) {
      return {
        success: false,
        error: "Solicitud no encontrada",
      }
    }

    if (booking.status !== "pending_payment" && booking.status !== "pending_confirmation") {
      return {
        success: false,
        error: "Esta solicitud ya fue procesada",
      }
    }

    // Update booking status to rejected
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "rejected",
        cancelled_by: user.id,
        cancelled_reason: reason || "Rechazada por el asesor",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    if (updateError) throw updateError

    // Create notification for student
    await supabase.from("notifications").insert({
      user_id: booking.student_id,
      type: "booking_rejected",
      title: "Solicitud Rechazada",
      message: reason
        ? `Tu solicitud de asesoría fue rechazada. Motivo: ${reason}`
        : "Tu solicitud de asesoría fue rechazada por el asesor.",
      data: { booking_id: bookingId, reason },
    })

    revalidatePath("/solicitudes-asesor")

    return {
      success: true,
      message: "Solicitud rechazada",
    }
  } catch (error) {
    console.error("[v0] rejectBookingRequest error:", error)
    return {
      success: false,
      error: "Error al rechazar la solicitud",
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
        price,
        created_at
      `
      )
      .eq("advisor_id", advisorId)
      .in("status", ["pending_payment", "pending_confirmation"])
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

// Get advisors list for students (with filters)
export async function getAdvisorsForStudents(filters?: {
  universidad?: string
  especialidad?: string
  precioMax?: number
}) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        avatar_url,
        bio,
        universidad,
        carrera,
        especialidades,
        precio_por_hora,
        disponibilidad,
        rating,
        total_reviews,
        sesiones_completadas
      `
      )
      .eq("role", "asesor")
      .order("rating", { ascending: false })

    if (filters?.universidad) {
      query = query.eq("universidad", filters.universidad)
    }

    if (filters?.precioMax) {
      query = query.lte("precio_por_hora", filters.precioMax)
    }

    const { data: advisors, error } = await query

    if (error) throw error

    // Filter by especialidad if provided (need to filter in JS because it's an array)
    let filteredAdvisors = advisors || []
    if (filters?.especialidad) {
      filteredAdvisors = filteredAdvisors.filter(
        (a) => a.especialidades?.includes(filters.especialidad)
      )
    }

    return {
      success: true,
      data: filteredAdvisors,
    }
  } catch (error) {
    console.error("[v0] getAdvisorsForStudents error:", error)
    return {
      success: false,
      error: "Error al cargar asesores",
      data: [],
    }
  }
}

// Get single advisor details for student view
export async function getAdvisorDetails(advisorId: string) {
  const supabase = await createClient()

  try {
    const { data: advisor, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        full_name,
        avatar_url,
        bio,
        universidad,
        carrera,
        especialidades,
        precio_por_hora,
        disponibilidad,
        rating,
        total_reviews,
        sesiones_completadas
      `
      )
      .eq("id", advisorId)
      .eq("role", "asesor")
      .single()

    if (error) throw error

    // Get recent reviews
    const { data: reviews } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        reviewer:profiles!reviewer_id(full_name, avatar_url)
      `
      )
      .eq("reviewed_id", advisorId)
      .order("created_at", { ascending: false })
      .limit(5)

    return {
      success: true,
      data: {
        ...advisor,
        reviews: reviews || [],
      },
    }
  } catch (error) {
    console.error("[v0] getAdvisorDetails error:", error)
    return {
      success: false,
      error: "Error al cargar detalles del asesor",
    }
  }
}
