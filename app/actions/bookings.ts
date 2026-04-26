"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { revalidatePath } from "next/cache"

// ─── Create a booking + Stripe Checkout Session ───────────────────────────
export async function createBooking(params: {
  advisorId: string
  advisorName: string
  scheduledAt: string      // ISO string
  durationMinutes: number
  modalidad: "virtual" | "presencial"
  notes?: string
  subject?: string
  pricePerHour: number     // in soles (e.g. 50)
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) throw new Error("No autenticado")

  const { data: studentProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

  // Price in centimos (x100 for Stripe)
  const priceInCentimos = params.pricePerHour * 100
  const platformFeeCentimos = Math.round(priceInCentimos * 0.1)
  const totalCentimos = priceInCentimos + platformFeeCentimos
  const advisorAmountCentimos = priceInCentimos

  const scheduledDate = new Date(params.scheduledAt)
  const autoReleaseAt = new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000) // +24h

  // 1. Insert booking in DB with status pending_payment
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      student_id: user.id,
      advisor_id: params.advisorId,
      title: params.subject ? `Asesoría: ${params.subject}` : "Asesoría",
      subject: params.subject,
      notes: params.notes,
      scheduled_at: params.scheduledAt,
      duration_minutes: params.durationMinutes,
      modalidad: params.modalidad,
      price: priceInCentimos,
      platform_fee: platformFeeCentimos,
      advisor_amount: advisorAmountCentimos,
      currency: "PEN",
      status: "pending_payment",
      auto_release_at: autoReleaseAt.toISOString(),
      advisor_name: params.advisorName,
      student_name: studentProfile?.full_name || user.email?.split("@")[0] || "Estudiante",
    })
    .select()
    .single()

  if (bookingError || !booking) {
    console.error("[v0] Booking insert error:", bookingError)
    throw new Error("Error al crear la reserva")
  }

  // 2. Create Stripe Checkout Session
  const dateFormatted = scheduledDate.toLocaleDateString("es-PE", {
    weekday: "short", day: "numeric", month: "short",
  })
  const timeFormatted = scheduledDate.toLocaleTimeString("es-PE", {
    hour: "2-digit", minute: "2-digit",
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "pen",
          product_data: {
            name: booking.title,
            description: `Con ${params.advisorName} · ${dateFormatted} ${timeFormatted} · ${params.modalidad}`,
          },
          unit_amount: totalCentimos,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/pago/exito?checkout_session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
    cancel_url: `${baseUrl}/agendar/${params.advisorId}?cancelled=true`,
    customer_email: studentProfile?.email || user.email,
    metadata: {
      booking_id: booking.id,
      advisor_id: params.advisorId,
      advisor_name: params.advisorName,
      student_id: user.id,
      subject: params.subject || "",
      scheduled_at: params.scheduledAt,
      platform_fee_centimos: platformFeeCentimos.toString(),
      advisor_amount_centimos: advisorAmountCentimos.toString(),
    },
  })

  // 3. Update booking with stripe checkout session id
  await supabase
    .from("bookings")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", booking.id)

  return { bookingId: booking.id, checkoutUrl: session.url! }
}

// ─── Confirm payment after Stripe success ─────────────────────────────────
export async function confirmBookingPayment(params: {
  bookingId: string
  checkoutSessionId: string
}) {
  const supabase = await createClient()

  // Verify with Stripe
  const session = await stripe.checkout.sessions.retrieve(params.checkoutSessionId)

  if (session.payment_status !== "paid") {
    throw new Error("El pago no fue completado")
  }

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id

  // Update booking to confirmed
  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      stripe_payment_intent_id: paymentIntentId || null,
      stripe_checkout_session_id: params.checkoutSessionId,
    })
    .eq("id", params.bookingId)
    .eq("status", "pending_payment")
    .select()
    .single()

  if (error) {
    console.error("[v0] confirmBookingPayment error:", error)
    // Might already be confirmed — fetch current state
    const { data: existing } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", params.bookingId)
      .single()
    return existing
  }

  // Insert payment record in escrow
  if (booking) {
    await supabase.from("payments").insert({
      booking_id: booking.id,
      payer_id: booking.student_id,
      payee_id: booking.advisor_id,
      amount: booking.price,
      platform_fee: booking.platform_fee,
      advisor_amount: booking.advisor_amount,
      currency: booking.currency,
      status: "in_escrow",
      stripe_payment_intent_id: paymentIntentId || null,
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

  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      student_confirmed: occurred,
      student_confirmed_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("student_id", user.id)
    .select()
    .single()

  if (error) throw new Error("Error al confirmar sesión")

  // Resolve escrow if both confirmed
  await resolveEscrowIfReady(bookingId)

  revalidatePath("/mis-sesiones")
  return booking
}

// ─── Advisor confirms session occurred ───────────────────────────────────
export async function advisorConfirmSession(bookingId: string, occurred: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      advisor_confirmed: occurred,
      advisor_confirmed_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("advisor_id", user.id)
    .select()
    .single()

  if (error) throw new Error("Error al confirmar sesión")

  await resolveEscrowIfReady(bookingId)

  revalidatePath("/mis-sesiones-asesor")
  return booking
}

// ─── Internal: resolve escrow when both parties have answered ─────────────
async function resolveEscrowIfReady(bookingId: string) {
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single()

  if (!booking) return

  const { student_confirmed, advisor_confirmed } = booking

  // Both answered
  if (student_confirmed !== null && advisor_confirmed !== null) {
    if (student_confirmed === true && advisor_confirmed === true) {
      // Both confirm → release escrow
      await supabase
        .from("bookings")
        .update({ status: "completed", escrow_released_at: new Date().toISOString() })
        .eq("id", bookingId)

      await supabase
        .from("payments")
        .update({ status: "released", escrow_released_at: new Date().toISOString() })
        .eq("booking_id", bookingId)

      // Update advisor stats
      await supabase.rpc("increment_advisor_sessions", { advisor_id: booking.advisor_id }).catch(() => {})
    } else {
      // Conflict → dispute
      await supabase
        .from("bookings")
        .update({ status: "disputed" })
        .eq("id", bookingId)
    }
  }
}

// ─── Fetch bookings for current user ─────────────────────────────────────
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
