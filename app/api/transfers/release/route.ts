import { NextResponse } from "next/server"
import { getStripe, splitAmount } from "@/lib/stripe"
import { createPayout } from "@/lib/paypal"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

/**
 * POST /api/transfers/release
 * Body: { bookingId: string }
 *
 * Releases the escrowed funds to the advisor's Connect account once the
 * class is confirmed as completed. Can be called:
 * - by the student confirming the class (authenticated session), or
 * - by a cron job with the CRON_SECRET bearer token (auto-release).
 */
export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId requerido" }, { status: 400 })
    }

    // ── Authorize: session user OR cron secret ────────────────────────────
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    const isCron =
      cronSecret && authHeader === `Bearer ${cronSecret}`

    let callerUserId: string | null = null
    if (!isCron) {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
      }
      callerUserId = user.id
    }

    // Service client: transfers must update rows regardless of RLS
    const admin = createServiceClient()

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select(
        "id, student_id, advisor_id, price, status, stripe_payment_intent_id, stripe_transfer_id, transfer_released_at"
      )
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    // Only the booking's student (or cron) may release funds
    if (!isCron && callerUserId !== booking.student_id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Idempotency: already released
    if (booking.stripe_transfer_id || booking.transfer_released_at) {
      return NextResponse.json({
        message: "Los fondos ya fueron liberados",
        transferId: booking.stripe_transfer_id,
      })
    }

    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: "Esta reserva no tiene un pago asociado" },
        { status: 409 }
      )
    }

    // Verify the payment actually succeeded
    const stripe = getStripe()
    const pi = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)
    if (pi.status !== "succeeded") {
      return NextResponse.json(
        { error: "El pago aún no se ha completado" },
        { status: 409 }
      )
    }

    // Advisor's payout configuration
    const { data: advisorProfile } = await admin
      .from("profiles")
      .select("stripe_account_id, stripe_onboarding_complete, payout_method, paypal_email")
      .eq("id", booking.advisor_id)
      .single()

    const payoutMethod = advisorProfile?.payout_method === "paypal" ? "paypal" : "stripe"

    if (payoutMethod === "paypal" && !advisorProfile?.paypal_email) {
      return NextResponse.json(
        { error: "El asesor no tiene un correo de PayPal configurado" },
        { status: 409 }
      )
    }

    if (payoutMethod === "stripe" && !advisorProfile?.stripe_account_id) {
      return NextResponse.json(
        { error: "El asesor no tiene cuenta de pagos configurada" },
        { status: 409 }
      )
    }

    // Net amount for the advisor (price is in cents)
    const { advisorAmount } = splitAmount(booking.price)
    const now = new Date().toISOString()

    if (payoutMethod === "paypal") {
      try {
        const payout = await createPayout({
          batchId: `booking-${booking.id}`,
          recipientEmail: advisorProfile!.paypal_email!,
          amountInCents: advisorAmount,
          currency: "EUR",
          note: `Pago Univvy - reserva ${booking.id}`,
        })

        await admin
          .from("bookings")
          .update({
            stripe_transfer_id: `paypal:${payout.payoutBatchId}`,
            transfer_released_at: now,
            status: "completed",
            escrow_released_at: now,
          })
          .eq("id", booking.id)

        await admin
          .from("payments")
          .update({
            status: "released",
            payout_method: "paypal",
            payout_note: `PayPal batch ${payout.payoutBatchId} (${payout.status})`,
          })
          .eq("booking_id", booking.id)

        return NextResponse.json({
          transferId: payout.payoutBatchId,
          amount: advisorAmount,
          method: "paypal",
        })
      } catch (payoutError) {
        // Do not mark the booking as released if PayPal failed (e.g. Univvy's
        // PayPal balance is insufficient). The student's escrowed funds stay
        // untouched until this is retried.
        const message =
          payoutError instanceof Error ? payoutError.message : "Error al pagar por PayPal"
        console.error("[v0] PayPal payout failed:", payoutError)

        await admin
          .from("payments")
          .update({ payout_method: "paypal", payout_note: `Fallo: ${message}` })
          .eq("booking_id", booking.id)

        return NextResponse.json({ error: message }, { status: 502 })
      }
    }

    // Get the charge id to link the transfer to the original payment
    const latestCharge =
      typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id

    const transfer = await stripe.transfers.create({
      amount: advisorAmount,
      currency: "eur",
      destination: advisorProfile!.stripe_account_id!,
      source_transaction: latestCharge,
      metadata: {
        booking_id: booking.id,
        advisor_id: booking.advisor_id,
        student_id: booking.student_id,
      },
    })

    await admin
      .from("bookings")
      .update({
        stripe_transfer_id: transfer.id,
        transfer_released_at: now,
        status: "completed",
        escrow_released_at: now,
      })
      .eq("id", booking.id)

    await admin
      .from("payments")
      .update({ stripe_transfer_id: transfer.id, status: "released", payout_method: "stripe" })
      .eq("booking_id", booking.id)

    return NextResponse.json({ transferId: transfer.id, amount: advisorAmount, method: "stripe" })
  } catch (error) {
    console.error("[v0] Transfer release error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
