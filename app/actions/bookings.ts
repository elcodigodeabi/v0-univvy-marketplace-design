"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createNotification, createNotifications } from "@/lib/notifications"
import { releaseEscrowFunds, refundEscrowFunds } from "@/lib/escrow"

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

    let { data: studentProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()

    // Safety net: ensure the student has a profile row (FK requirement)
    if (!studentProfile) {
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name:
            (user.user_metadata?.full_name as string) ||
            user.email?.split("@")[0] ||
            "Estudiante",
          role: "alumno",
        })
        .select("full_name, email")
        .single()

      if (profileError) {
        console.error("[v0] Error creating student profile:", profileError)
        throw new Error("No se pudo completar tu perfil. Vuelve a iniciar sesión e intenta de nuevo.")
      }
      studentProfile = newProfile
    }

    const { advisorAmountCents, platformFeeCents, totalCents } = calculatePricing(
      params.pricePerHour,
      params.durationMinutes
    )

    const scheduledDate = new Date(params.scheduledAt)
    const autoReleaseAt = new Date(
      scheduledDate.getTime() + params.durationMinutes * 60 * 1000 + AUTO_RELEASE_HOURS * 60 * 60 * 1000
    )

    const title = params.subject ? `Asesoría: ${params.subject}` : "Asesoría"

    // ─── Validate no overlapping bookings for this student ───────────────────
    const requestedStart = new Date(params.scheduledAt)
    const requestedEnd = new Date(requestedStart.getTime() + params.durationMinutes * 60 * 1000)

    const { data: conflictingBookings, error: conflictError } = await supabase
      .from("bookings")
      .select("id, scheduled_at, duration_minutes, status")
      .eq("student_id", user.id)
      .in("status", ["pending_request", "pending_payment", "confirmed", "in_progress"])

    if (conflictError) {
      console.error("[v0] Error checking booking conflicts:", conflictError)
    } else if (conflictingBookings && conflictingBookings.length > 0) {
      for (const existing of conflictingBookings) {
        const existingStart = new Date(existing.scheduled_at)
        const existingEnd = new Date(existingStart.getTime() + existing.duration_minutes * 60 * 1000)

        // Check if time slots overlap
        if (requestedStart < existingEnd && requestedEnd > existingStart) {
          throw new Error(
            `Ya tienes una sesión programada en ese horario. Por favor elige otro horario.`
          )
        }
      }
    }

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
        // Foreign key violation: advisor_id doesn't reference a real profile
        if (bookingError.message?.includes("advisor_id")) {
          throw new Error("Este asesor no está disponible para reservas")
        }
        throw new Error("No se pudo crear la reserva. Verifica tu sesión e intenta de nuevo.")
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

// ─── Fetch a booking summary for the payment page ─────────────────────────
export async function getBookingForPayment(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id, status, price, currency, subject, title, scheduled_at, duration_minutes, modalidad,
      stripe_payment_intent_id,
      advisor:profiles!bookings_advisor_id_fkey(id, full_name, avatar_url),
      payments(status)
    `)
    .eq("id", bookingId)
    .eq("student_id", user.id)
    .single()

  if (error || !booking) throw new Error("Reserva no encontrada")

  const payment = Array.isArray(booking.payments) ? booking.payments[0] : booking.payments

  return {
    id: booking.id,
    status: booking.status as string,
    price: booking.price as number,
    currency: (booking.currency as string) || "EUR",
    subject: booking.subject as string | null,
    title: booking.title as string,
    scheduledAt: booking.scheduled_at as string,
    durationMinutes: booking.duration_minutes as number,
    modalidad: booking.modalidad as string,
    advisor: (Array.isArray(booking.advisor) ? booking.advisor[0] : booking.advisor) as
      | { id: string; full_name: string | null; avatar_url: string | null }
      | null,
    paymentStatus: (payment as { status?: string } | null)?.status || "pending",
  }
}

// ─── Fetch a receipt for the payment success page ─────────────────────────
// Accessible to either party of the booking (student who paid, or advisor).
export async function getBookingReceipt(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id, status, price, currency, subject, title, scheduled_at, duration_minutes, modalidad,
      student_id, advisor_id, stripe_payment_intent_id,
      advisor:profiles!bookings_advisor_id_fkey(id, full_name),
      student:profiles!bookings_student_id_fkey(id, full_name),
      payments(status, escrow_released_at, refunded_at, refund_reason, amount, platform_fee, advisor_amount, currency, created_at, stripe_payment_intent_id)
    `)
    .eq("id", bookingId)
    .single()

  if (error || !booking) throw new Error("Reserva no encontrada")
  if (booking.student_id !== user.id && booking.advisor_id !== user.id) {
    throw new Error("No tienes acceso a este comprobante")
  }

  const payment = Array.isArray(booking.payments) ? booking.payments[0] : booking.payments

  return {
    id: booking.id,
    status: booking.status as string,
    price: booking.price as number,
    currency: (booking.currency as string) || "EUR",
    subject: booking.subject as string | null,
    title: booking.title as string,
    scheduledAt: booking.scheduled_at as string,
    durationMinutes: booking.duration_minutes as number,
    modalidad: booking.modalidad as string,
    advisorName:
      (Array.isArray(booking.advisor) ? booking.advisor[0]?.full_name : (booking.advisor as any)?.full_name) ||
      "Asesor",
    studentName:
      (Array.isArray(booking.student) ? booking.student[0]?.full_name : (booking.student as any)?.full_name) ||
      "Alumno",
    referenceId: booking.stripe_payment_intent_id as string | null,
    payment: payment
      ? {
          status: payment.status as string,
          amount: payment.amount as number,
          platformFee: payment.platform_fee as number,
          advisorAmount: payment.advisor_amount as number,
          currency: (payment.currency as string) || "EUR",
          createdAt: payment.created_at as string,
          escrowReleasedAt: payment.escrow_released_at as string | null,
          refundedAt: payment.refunded_at as string | null,
          refundReason: payment.refund_reason as string | null,
        }
      : null,
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
  const sessionLabel = booking.subject || booking.title || "tu asesoría"

  if (bothConfirmed) {
    await supabase
      .from("bookings")
      .update({ status: "completed", escrow_released_at: new Date().toISOString() })
      .eq("id", bookingId)

    const result = await releaseEscrowFunds(bookingId)

    await supabase.rpc("increment_advisor_sessions", { advisor_id: booking.advisor_id }).catch(() => {})

    if ("error" in result) {
      console.error("[v0] Error liberando pago en garantía:", result.error)
    }

    await createNotifications([
      {
        userId: booking.student_id,
        type: "payment_released",
        title: "Pago liberado al asesor",
        body: `Ambos confirmaron que la sesión de ${sessionLabel} se realizó. El pago fue liberado al asesor.`,
        data: { booking_id: bookingId },
      },
      {
        userId: booking.advisor_id,
        type: "payment_released",
        title: "¡Pago recibido!",
        body: `El alumno confirmó la sesión de ${sessionLabel}. Tu pago ya fue transferido.`,
        data: { booking_id: bookingId },
      },
    ])
  } else if (neitherConfirmed) {
    await supabase
      .from("bookings")
      .update({ status: "refunded", cancelled_at: new Date().toISOString() })
      .eq("id", bookingId)

    const result = await refundEscrowFunds(bookingId, "session_not_held")
    if ("error" in result) {
      console.error("[v0] Error reembolsando pago:", result.error)
    } else {
      await supabase
        .from("payments")
        .update({ status: "refunded", refunded_at: new Date().toISOString(), refund_reason: "session_not_held" })
        .eq("booking_id", bookingId)
    }

    await createNotifications([
      {
        userId: booking.student_id,
        type: "payment_released",
        title: "Pago reembolsado",
        body: `Tanto tú como el asesor indicaron que la sesión de ${sessionLabel} no se realizó. Tu pago fue reembolsado.`,
        data: { booking_id: bookingId },
      },
      {
        userId: booking.advisor_id,
        type: "booking_cancelled",
        title: "Sesión no realizada",
        body: `Se confirmó que la sesión de ${sessionLabel} no se realizó. El pago fue reembolsado al alumno.`,
        data: { booking_id: bookingId },
      },
    ])
  } else {
    await supabase
      .from("bookings")
      .update({ status: "disputed" })
      .eq("id", bookingId)

    await createNotifications([
      {
        userId: booking.student_id,
        type: "dispute_opened",
        title: "Disputa abierta",
        body: `Hay una discrepancia sobre si la sesión de ${sessionLabel} se realizó. El equipo de Univvy revisará el caso.`,
        data: { booking_id: bookingId },
      },
      {
        userId: booking.advisor_id,
        type: "dispute_opened",
        title: "Disputa abierta",
        body: `Hay una discrepancia sobre si la sesión de ${sessionLabel} se realizó. El equipo de Univvy revisará el caso.`,
        data: { booking_id: bookingId },
      },
    ])
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

  const refundResult = await refundEscrowFunds(bookingId, reason)
  if (!("error" in refundResult)) {
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

  const otherUserId = isStudent ? booking.advisor_id : booking.student_id
  const sessionLabel = booking.subject || booking.title || "la sesión"
  await createNotification({
    userId: otherUserId,
    type: "booking_cancelled",
    title: "Sesión cancelada",
    body: `${isStudent ? "El alumno" : "El asesor"} canceló ${sessionLabel}. ${
      !("error" in refundResult) ? "El pago fue reembolsado." : ""
    }`,
    data: { booking_id: bookingId },
  })

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
      student:profiles!bookings_student_id_fkey(id, full_name, avatar_url),
      payments(status, stripe_payment_intent_id, escrow_released_at, refunded_at, refund_reason, amount, platform_fee, advisor_amount, currency, created_at)
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
      student:profiles!bookings_student_id_fkey(id, full_name, avatar_url, universidad, carrera),
      payments(status, stripe_payment_intent_id, escrow_released_at, refunded_at, refund_reason, amount, platform_fee, advisor_amount, currency, created_at)
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

    // ─── Google Calendar + Meet (non-blocking) ────────────────────────────
    // If the advisor connected Google Calendar, create the event with an
    // auto-generated Meet link and invite the student. Failure here must
    // NEVER block the booking confirmation.
    try {
      const { data: advisorProfile } = await supabase
        .from("profiles")
        .select("google_refresh_token, email, full_name")
        .eq("id", user.id)
        .single()

      if (advisorProfile?.google_refresh_token) {
        const { data: studentProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", booking.student_id)
          .single()

        const { createMeetEvent } = await import("@/lib/google-calendar")

        const start = new Date(booking.scheduled_at)
        const end = new Date(start.getTime() + booking.duration_minutes * 60 * 1000)

        const attendees = [advisorProfile.email, studentProfile?.email].filter(
          Boolean
        ) as string[]

        const event = await createMeetEvent({
          refreshToken: advisorProfile.google_refresh_token,
          summary: `Tutoría Univvy — ${booking.subject || booking.title || "Sesión"}`,
          description: [
            `Sesión de tutoría en Univvy.`,
            `Asesor: ${advisorProfile.full_name || ""}`,
            `Alumno: ${studentProfile?.full_name || booking.student_name || ""}`,
            booking.notes ? `Notas: ${booking.notes}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          startDateTime: start.toISOString(),
          endDateTime: end.toISOString(),
          attendees,
        })

        if (event.meetLink || event.eventId) {
          await supabase
            .from("bookings")
            .update({
              meeting_link: event.meetLink,
              google_event_id: event.eventId,
            })
            .eq("id", bookingId)
        }
      }
    } catch (calendarError) {
      // Log and continue — the booking is already confirmed.
      console.error("[v0] Google Calendar event creation failed (non-blocking):", calendarError)
    }

    await createNotification({
      userId: booking.student_id,
      type: "booking_confirmed",
      title: "Tu asesor aceptó la sesión",
      body: `${booking.advisor_name || "El asesor"} aceptó tu solicitud para ${booking.subject || booking.title || "la sesión"}.`,
      data: { booking_id: bookingId },
    })

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
    const refundResult = await refundEscrowFunds(bookingId, reason || "advisor_rejected")
    if (!("error" in refundResult)) {
      await supabase
        .from("payments")
        .update({ status: "refunded", refunded_at: new Date().toISOString() })
        .eq("booking_id", bookingId)
    }

    await createNotification({
      userId: booking.student_id,
      type: "booking_cancelled",
      title: "Tu solicitud fue rechazada",
      body: `El asesor no pudo aceptar tu solicitud para ${booking.subject || booking.title || "la sesión"}. ${
        !("error" in refundResult) ? "Tu pago fue reembolsado." : ""
      }`,
      data: { booking_id: bookingId },
    })

    revalidatePath("/solicitudes-asesor")
    revalidatePath("/mis-sesiones")
  } catch (error: any) {
    console.error("[v0] Error rejecting booking:", error)
    throw new Error(error?.message || "Error al rechazar la solicitud")
  }
}
