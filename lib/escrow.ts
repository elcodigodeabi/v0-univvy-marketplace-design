import "server-only"
import { getStripe, splitAmount } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/service"
import { createNotification } from "@/lib/notifications"

/**
 * Releases escrowed funds to the advisor's Stripe Connect account.
 * Idempotent: if a transfer already exists for this booking, it is returned
 * instead of creating a duplicate.
 */
export async function releaseEscrowFunds(bookingId: string) {
  const admin = createServiceClient()

  const { data: booking } = await admin
    .from("bookings")
    .select(
      "id, student_id, advisor_id, price, advisor_amount, stripe_payment_intent_id, stripe_transfer_id"
    )
    .eq("id", bookingId)
    .single()

  if (!booking) return { error: "Reserva no encontrada" as const }
  if (booking.stripe_transfer_id) {
    return { transferId: booking.stripe_transfer_id as string }
  }
  if (!booking.stripe_payment_intent_id) {
    return { error: "Esta reserva no tiene un pago asociado" as const }
  }

  const stripe = getStripe()
  const pi = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)
  if (pi.status !== "succeeded") {
    return { error: "El pago aún no se ha completado" as const }
  }

  const { data: advisorProfile } = await admin
    .from("profiles")
    .select("stripe_account_id, stripe_onboarding_complete")
    .eq("id", booking.advisor_id)
    .single()

  // Asesor sin Stripe configurado: el pago queda retenido como "pendiente de
  // cobro" (pending_payout). Se libera automáticamente cuando complete el
  // onboarding (webhook account.updated) o el admin puede registrar un pago
  // manual por transferencia bancaria.
  if (!advisorProfile?.stripe_account_id || !advisorProfile.stripe_onboarding_complete) {
    const { data: payment } = await admin
      .from("payments")
      .select("id, status")
      .eq("booking_id", booking.id)
      .single()

    if (payment && payment.status !== "pending_payout" && payment.status !== "released") {
      await admin
        .from("payments")
        .update({ status: "pending_payout", pending_payout_at: new Date().toISOString() })
        .eq("id", payment.id)

      await createNotification({
        userId: booking.advisor_id,
        type: "payment_released",
        title: "Tienes un pago pendiente de cobro",
        body: "Se completó una clase pero aún no has configurado tu cuenta bancaria. Configura Stripe para recibir el pago automáticamente.",
        data: { booking_id: booking.id },
      })
    }

    return { pendingPayout: true as const }
  }

  // Usa el monto congelado al crear la reserva (comisión pactada en su momento);
  // si no existe, recalcula con la comisión vigente (13%).
  const advisorAmount =
    typeof booking.advisor_amount === "number" && booking.advisor_amount > 0
      ? booking.advisor_amount
      : splitAmount(booking.price).advisorAmount
  const latestCharge =
    typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id

  const transfer = await stripe.transfers.create({
    amount: advisorAmount,
    currency: "eur",
    destination: advisorProfile.stripe_account_id,
    source_transaction: latestCharge,
    metadata: {
      booking_id: booking.id,
      advisor_id: booking.advisor_id,
      student_id: booking.student_id,
    },
  })

  const now = new Date().toISOString()

  await admin
    .from("bookings")
    .update({ stripe_transfer_id: transfer.id, transfer_released_at: now, escrow_released_at: now })
    .eq("id", booking.id)

  await admin
    .from("payments")
    .update({ stripe_transfer_id: transfer.id, status: "released", escrow_released_at: now })
    .eq("booking_id", booking.id)

  return { transferId: transfer.id, amount: advisorAmount }
}

/**
 * Refunds the student for a booking whose payment was captured but the
 * class did not happen (or was rejected/cancelled). Idempotent: checks for
 * an existing refund before creating a new one. If the payment was never
 * captured, cancels the PaymentIntent instead.
 */
export async function refundEscrowFunds(bookingId: string, reason: string) {
  const admin = createServiceClient()

  const { data: booking } = await admin
    .from("bookings")
    .select("id, stripe_payment_intent_id")
    .eq("id", bookingId)
    .single()

  if (!booking) return { error: "Reserva no encontrada" as const }
  if (!booking.stripe_payment_intent_id) {
    return { refunded: false as const }
  }

  const stripe = getStripe()
  const pi = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)

  if (pi.status !== "succeeded") {
    if (pi.status !== "canceled") {
      await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id).catch(() => {})
    }
    return { refunded: false as const }
  }

  const existingRefunds = await stripe.refunds.list({
    payment_intent: booking.stripe_payment_intent_id,
    limit: 1,
  })
  if (existingRefunds.data.length > 0) {
    return { refundId: existingRefunds.data[0].id }
  }

  const refund = await stripe.refunds.create({
    payment_intent: booking.stripe_payment_intent_id,
    reason: "requested_by_customer",
    metadata: { booking_id: booking.id, internal_reason: reason },
  })

  return { refundId: refund.id }
}
