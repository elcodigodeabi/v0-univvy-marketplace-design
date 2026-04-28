"use server"

import { createClient } from "@/lib/supabase/server"
import { calculatePricing, AUTO_RELEASE_HOURS } from "@/lib/stripe"
import {
  createStripeCheckoutSession,
  getStripeCheckoutSession,
  refundToStudent,
} from "@/app/actions/stripe"
import { revalidatePath } from "next/cache"

// ─── Create a booking + Stripe Checkout Session ───────────────────────────
export async function createBooking(params: {
  advisorId: string
  advisorName: string
  scheduledAt: string        // ISO string
  durationMinutes: number
  modalidad: "virtual" | "presencial"
  notes?: string
  subject?: string
  pricePerHour: number       // euros, e.g. 25
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error("No autenticado")

  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

  // Calculate EUR cents
  const { advisorAmountCents, platformFeeCents, totalCents } = calculatePricing(
    params.pricePerHour,
    params.durationMinutes
  )

  const scheduledDate = new Date(params.scheduledAt)
  const autoReleaseAt = new Date(
    scheduledDate.getTime() + params.durationMinutes * 60 * 1000 + AUTO_RELEASE_HOURS * 60 * 60 * 1000
  )

  const title = params.subject ? `Asesoría: ${params.subject}` : "Asesoría"
  const dateFormatted = scheduledDate.toLocaleDateString("es-ES", {
    weekday: "short", day: "numeric", month: "short",
  })
  const timeFormatted = scheduledDate.toLocaleTimeString("es-ES", {
    hour: "2-digit", minute: "2-digit",
  })

  // 1. Insert booking with status pending_payment
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
      status: "pending_payment",
      auto_release_at: autoReleaseAt.toISOString(),
      advisor_name: params.advisorName,
      student_name: studentProfile?.full_name || user.email?.split("@")[0] || "Estudiante",
    })
    .select()
    .single()

  if (bookingError || !booking) {
    throw new Error("Error al crear la reserva")
  }

  // 2. Create Stripe Checkout Session in EUR
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const { checkoutUrl, checkoutSessionId } = await createStripeCheckoutSession({
    bookingId: booking.id,
    advisorId: params.advisorId,
    advisorName: params.advisorName,
    studentEmail: studentProfile?.email || user.email!,
    title,
    description: `Con ${params.advisorName} · ${dateFormatted} ${timeFormatted} · ${params.modalidad}`,
    pricePerHour: params.pricePerHour,
    durationMinutes: params.durationMinutes,
    cancelUrl: `${baseUrl}/agendar/${params.advisorId}?cancelled=true`,
  })

  // 3. Persist checkout session ID on booking
  await supabase
    .from("bookings")
    .update({ stripe_checkout_session_id: checkoutSessionId })
    .eq("id", booking.id)

  return { bookingId: booking.id, checkoutUrl }
}

// ─── Confirm payment after Stripe success redirect ────────────────────────
export async function confirmBookingPayment(params: {
  bookingId: string
  checkoutSessionId: string
}) {
  const supabase = await createClient()

  // Verify with Stripe — never trust the URL params alone
  const session = await getStripeCheckoutSession(params.checkoutSessionId)

  if (session.payment_status !== "paid") {
    throw new Error("El pago no fue completado")
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  // Upsert: move pending_payment → confirmed (idempotent)
  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: params.checkoutSessionId,
    })
    .eq("id", params.bookingId)
    .eq("status", "pending_payment")
    .select()
    .single()

  if (error) {
    // Already confirmed (e.g. webhook fired first) — return current state
    const { data: existing } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", params.bookingId)
      .single()
    return existing
  }

  // Insert escrow payment record
  if (booking) {
    await supabase.from("payments").insert({
      booking_id: booking.id,
      payer_id: booking.student_id,
      payee_id: booking.advisor_id,
      amount: booking.price,
      platform_fee: booking.platform_fee,
      advisor_amount: booking.advisor_amount,
      currency: "EUR",
      status: "in_escrow",
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: params.checkoutSessionId,
    })
  }

  revalidatePath("/mis-sesiones")
  return booking
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
    // Both say it happened → release escrow, mark completed
    await supabase
      .from("bookings")
      .update({ status: "completed", escrow_released_at: new Date().toISOString() })
      .eq("id", bookingId)

    await supabase
      .from("payments")
      .update({ status: "released", escrow_released_at: new Date().toISOString() })
      .eq("booking_id", bookingId)

    // Increment advisor's completed sessions count
    await supabase.rpc("increment_advisor_sessions", { advisor_id: booking.advisor_id }).catch(() => {})

  } else if (neitherConfirmed) {
    // Both say it didn't happen → auto-refund student
    if (booking.stripe_payment_intent_id) {
      await refundToStudent({
        paymentIntentId: booking.stripe_payment_intent_id,
        bookingId,
        reason: "session_not_held",
      })
    }

    await supabase
      .from("bookings")
      .update({ status: "refunded", cancelled_at: new Date().toISOString() })
      .eq("id", bookingId)

    await supabase
      .from("payments")
      .update({ status: "refunded", refunded_at: new Date().toISOString(), refund_reason: "session_not_held" })
      .eq("booking_id", bookingId)

  } else {
    // Conflict → escalate to dispute (Univvy admin resolves)
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

  // Only cancellable if confirmed (not started/completed/disputed)
  if (!["confirmed", "pending_payment"].includes(booking.status)) {
    throw new Error("Esta reserva no se puede cancelar")
  }

  // Refund student if payment was captured
  if (booking.status === "confirmed" && booking.stripe_payment_intent_id) {
    await refundToStudent({
      paymentIntentId: booking.stripe_payment_intent_id,
      bookingId,
      reason: "cancellation",
    })
    await supabase
      .from("payments")
      .update({ status: "refunded", refunded_at: new Date().toISOString(), refund_reason: reason })
      .eq("booking_id", bookingId)
  }

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
