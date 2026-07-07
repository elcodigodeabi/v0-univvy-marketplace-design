"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const PLATFORM_FEE_PERCENT = 0.10
const AUTO_RELEASE_HOURS = 24

function calculatePricing(pricePerHour: number, durationMinutes: number) {
  const totalCents = Math.round((pricePerHour * durationMinutes) / 60 * 100)
  const platformFeeCents = Math.round(totalCents * PLATFORM_FEE_PERCENT)
  const advisorAmountCents = totalCents - platformFeeCents
  return { totalCents, platformFeeCents, advisorAmountCents }
}

// ─── Create a booking ─────────────────────────────────────────────────────
export async function createBooking(params: {
  advisorId: string
  advisorName: string
  scheduledAt: string
  durationMinutes: number
  modalidad: "virtual" | "presencial"
  notes?: string
  subject?: string
  pricePerHour: number
}) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("No autenticado")

    const { data: studentProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()

    const { advisorAmountCents, platformFeeCents, totalCents } = calculatePricing(
      params.pricePerHour,
      params.durationMinutes
    )

    const scheduledDate = new Date(params.scheduledAt)
    const autoReleaseAt = new Date(
      scheduledDate.getTime() + params.durationMinutes * 60 * 1000 + AUTO_RELEASE_HOURS * 60 * 60 * 1000
    )

    const title = params.subject ? `Asesoría: ${params.subject}` : "Asesoría"

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        student_id: user.id,
        advisor_id: params.advisorId,
        title,
        subject: params.subject,
        notes: params.notes,
        scheduled_at: params.scheduledAt,
        duration_minutes: params.durationMinutes,
        modalidad: params.modalidad,
        price: totalCents,
        platform_fee: platformFeeCents,
        advisor_amount: advisorAmountCents,
        currency: "EUR",
        status: "pending_request",
        auto_release_at: autoReleaseAt.toISOString(),
        advisor_name: params.advisorName,
        student_name: studentProfile?.full_name || user.email?.split("@")[0] || "Estudiante",
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error("[v0] Booking insert error:", bookingError)
      if (bookingError?.code === "23503") {
        throw new Error("Este asesor no está disponible para reservas")
      }
      throw new Error(bookingError?.message || "Error al crear la reserva")
    }

    // Insert payment record as pending
    const { error: paymentError } = await supabase.from("payments").insert({
      booking_id: booking.id,
      payer_id: booking.student_id,
      payee_id: booking.advisor_id,
      amount: totalCents,
      platform_fee: platformFeeCents,
      advisor_amount: advisorAmountCents,
      currency: "EUR",
      status: "pending",
    })

    if (paymentError) {
      console.error("[v0] Payment insert error:", paymentError)
    }

    revalidatePath("/mis-sesiones")
    return { bookingId: booking.id }
  } catch (error: any) {
    console.error("[v0] Error creating booking:", error)
    throw new Error(error?.message || "Error al crear la reserva. Intenta de nuevo.")
  }
}

// ─── Student confirms session occurred ────────────────────────────────────
export async function studentConfirmSession(bookingId: string, occurred: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  await supabase
    .from("bookings")
    .update({
      student_confirmed: occurred,
      student_confirmed_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("student_id", user.id)

  await resolveEscrowIfReady(bookingId)
  revalidatePath("/mis-sesiones")
}

// ─── Advisor confirms session occurred ───────────────────────────────────
export async function advisorConfirmSession(bookingId: string, occurred: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  await supabase
    .from("bookings")
    .update({
      advisor_confirmed: occurred,
      advisor_confirmed_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("advisor_id", user.id)

  await resolveEscrowIfReady(bookingId)
  revalidatePath("/mis-sesiones-asesor")
}

// ─── Internal: resolve escrow when both parties have confirmed ────────────
async function resolveEscrowIfReady(bookingId: string) {
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single()

  if (!booking) return
  if (booking.student_confirmed === null || booking.advisor_confirmed === null) return

  const bothConfirmed = booking.student_confirmed === true && booking.advisor_confirmed === true
  const neitherConfirmed = booking.student_confirmed === false && booking.advisor_confirmed === false

  if (bothConfirmed) {
    await supabase
      .from("bookings")
      .update({ status: "completed", escrow_released_at: new Date().toISOString() })
      .eq("id", bookingId)

    await supabase
      .from("payments")
      .update({ status: "released", escrow_released_at: new Date().toISOString() })
      .eq("booking_id", bookingId)

    await supabase.rpc("increment_advisor_sessions", { advisor_id: booking.advisor_id }).catch(() => {})

  } else if (neitherConfirmed) {
    await supabase
      .from("bookings")
      .update({ status: "refunded", cancelled_at: new Date().toISOString() })
      .eq("id", bookingId)

    await supabase
      .from("payments")
      .update({ status: "refunded", refunded_at: new Date().toISOString(), refund_reason: "session_not_held" })
      .eq("booking_id", bookingId)

  } else {
    await supabase
      .from("bookings")
      .update({ status: "disputed" })
      .eq("id", bookingId)
  }
}

// ─── Cancel a booking ─────────────────────────────────────────────────────
export async function cancelBooking(bookingId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single()

  if (!booking) throw new Error("Reserva no encontrada")

  const isStudent = booking.student_id === user.id
  const isAdvisor = booking.advisor_id === user.id
  if (!isStudent && !isAdvisor) throw new Error("Sin permisos para cancelar esta reserva")

  if (!["confirmed", "pending_payment"].includes(booking.status)) {
    throw new Error("Esta reserva no se puede cancelar")
  }

  await supabase
    .from("payments")
    .update({ status: "refunded", refunded_at: new Date().toISOString(), refund_reason: reason })
    .eq("booking_id", bookingId)

  await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_by: user.id,
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  revalidatePath("/mis-sesiones")
  revalidatePath("/mis-sesiones-asesor")
}

// ─── Fetch bookings for current user (student view) ───────────────────────
export async function getMyBookings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("bookings")
    .select(`
      *,
      advisor:profiles!bookings_advisor_id_fkey(id, full_name, avatar_url, especialidades, universidad),
      student:profiles!bookings_student_id_fkey(id, full_name, avatar_url)
    `)
    .eq("student_id", user.id)
    .order("scheduled_at", { ascending: false })

  return data || []
}

// ─── Fetch bookings for current user (advisor view) ───────────────────────
export async function getMyAdvisorBookings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("bookings")
    .select(`
      *,
      student:profiles!bookings_student_id_fkey(id, full_name, avatar_url, universidad, carrera)
    `)
    .eq("advisor_id", user.id)
    .order("scheduled_at", { ascending: false })

  return data || []
}

// ─── Advisor accepts a booking request ────────────────────────────────────
export async function acceptBookingRequest(bookingId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("advisor_id", user.id)
      .single()

    if (!booking) throw new Error("Solicitud no encontrada")
    if (booking.status !== "pending_request") throw new Error("Esta solicitud ya fue procesada")

    // Create a chat for this booking
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({
        student_id: booking.student_id,
        advisor_id: booking.advisor_id,
        booking_id: bookingId,
      })
      .select()
      .single()

    if (chatError) {
      console.error("[v0] Error creating chat:", chatError)
    }

    // Update booking status to confirmed
    await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId)

    revalidatePath("/solicitudes-asesor")
    revalidatePath("/mis-sesiones-asesor")
    return { chatId: chat?.id }
  } catch (error: any) {
    console.error("[v0] Error accepting booking:", error)
    throw new Error(error?.message || "Error al aceptar la solicitud")
  }
}

// ─── Advisor rejects a booking request ────────────────────────────────────
export async function rejectBookingRequest(bookingId: string, reason?: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No autenticado")

    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("advisor_id", user.id)
      .single()

    if (!booking) throw new Error("Solicitud no encontrada")
    if (booking.status !== "pending_request") throw new Error("Esta solicitud ya fue procesada")

    // Update booking status to rejected
    await supabase
      .from("bookings")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || "El asesor no está disponible en este momento",
      })
      .eq("id", bookingId)

    // Refund payment if exists
    await supabase
      .from("payments")
      .update({ status: "refunded", refunded_at: new Date().toISOString() })
      .eq("booking_id", bookingId)

    revalidatePath("/solicitudes-asesor")
    revalidatePath("/mis-sesiones")
  } catch (error: any) {
    console.error("[v0] Error rejecting booking:", error)
    throw new Error(error?.message || "Error al rechazar la solicitud")
  }
}
