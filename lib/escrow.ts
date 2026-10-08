import "server-only"
import { getStripe, splitAmount } from "@/lib/stripe"
import { createPayout } from "@/lib/paypal"
import { createServiceClient } from "@/lib/supabase/service"

export type ReleaseResult =
  | { transferId: string; amount?: number; method?: "stripe" | "paypal"; alreadyReleased?: boolean }
  | { error: string; retryable: boolean }

function fail(error: string, retryable = false): { error: string; retryable: boolean } {
  return { error, retryable }
}

/**
 * Releases escrowed funds to the advisor using their active payout method
 * (Stripe Connect or PayPal). The amount is always the `advisor_amount`
 * stored on the booking, so what the advisor was shown is what they get and
 * the commission stays on Univvy's balance.
 *
 * Idempotent: if a transfer already exists for this booking it is returned
 * instead of creating a duplicate. The booking is only marked as released
 * after the money has actually been sent.
 */
export async function releaseEscrowFunds(bookingId: string): Promise<ReleaseResult> {
  const admin = createServiceClient()

  const { data: booking } = await admin
    .from("bookings")
    .select(
      "id, student_id, advisor_id, price, advisor_amount, platform_fee, status, stripe_payment_intent_id, stripe_transfer_id"
    )
    .eq("id", bookingId)
    .single()

  if (!booking) return fail("Reserva no encontrada")
  if (booking.stripe_transfer_id) {
    return { transferId: booking.stripe_transfer_id as string, alreadyReleased: true }
  }
  if (booking.status === "refunded" || booking.status === "cancelled") {
    return fail("La reserva fue reembolsada o cancelada")
  }
  if (!booking.stripe_payment_intent_id) {
    return fail("Esta reserva no tiene un pago asociado")
  }

  const { data: advisorProfile } = await admin
    .from("profiles")
    .select("stripe_account_id, payout_method, paypal_email")
    .eq("id", booking.advisor_id)
    .single()

  const payoutMethod = advisorProfile?.payout_method === "paypal" ? "paypal" : "stripe"

  if (payoutMethod === "paypal" && !advisorProfile?.paypal_email) {
    return fail("El asesor no tiene un correo de PayPal configurado")
  }
  if (payoutMethod === "stripe" && !advisorProfile?.stripe_account_id) {
    return fail("El asesor no tiene cuenta de pagos configurada")
  }

  const stripe = getStripe()
  const pi = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id, {
    expand: ["latest_charge.balance_transaction"],
  })
  if (pi.status !== "succeeded") {
    return fail("El pago aún no se ha completado")
  }

  const charge = typeof pi.latest_charge === "object" ? pi.latest_charge : null
  if (charge?.refunded || (charge?.amount_refunded ?? 0) > 0) {
    return fail("El pago ya fue reembolsado")
  }

  const advisorAmount: number =
    typeof booking.advisor_amount === "number" && booking.advisor_amount > 0
      ? booking.advisor_amount
      : splitAmount(booking.price).advisorAmount

  if (advisorAmount <= 0 || advisorAmount > pi.amount) {
    return fail("El monto a liberar no es válido")
  }

  const platformFee = pi.amount - advisorAmount
  const balanceTx =
    charge && typeof charge.balance_transaction === "object" ? charge.balance_transaction : null
  const stripeFee = balanceTx?.fee ?? null
  const feeNote =
    `comisión Univvy ${platformFee}c` + (stripeFee !== null ? `, tarifa Stripe ${stripeFee}c` : "")

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

      await markReleased(admin, booking.id, {
        transferRef: `paypal:${payout.payoutBatchId}`,
        method: "paypal",
        note: `PayPal batch ${payout.payoutBatchId} (${payout.status}) · ${feeNote}`,
        now,
      })

      return { transferId: payout.payoutBatchId, amount: advisorAmount, method: "paypal" }
    } catch (payoutError) {
      const message =
        payoutError instanceof Error ? payoutError.message : "Error al pagar por PayPal"
      console.error("[v0] PayPal payout failed:", payoutError)
      await admin
        .from("payments")
        .update({ payout_method: "paypal", payout_note: `Fallo: ${message}` })
        .eq("booking_id", booking.id)
      return fail(message, true)
    }
  }

  const destination = advisorProfile!.stripe_account_id!

  try {
    const account = await stripe.accounts.retrieve(destination)

    const ownerId = account.metadata?.supabase_user_id
    if (ownerId && ownerId !== booking.advisor_id) {
      console.error("[v0] Stripe account owner mismatch", { destination, ownerId, advisor: booking.advisor_id })
      return fail("La cuenta de Stripe del asesor no corresponde a su usuario")
    }
    if (!account.payouts_enabled) {
      return fail("La cuenta de Stripe del asesor aún no puede recibir pagos. Debe completar su verificación.")
    }

    const transfer = await stripe.transfers.create(
      {
        amount: advisorAmount,
        currency: pi.currency,
        destination,
        source_transaction: charge?.id,
        transfer_group: `booking_${booking.id}`,
        description: `Univvy - reserva ${booking.id}`,
        metadata: {
          booking_id: booking.id,
          advisor_id: booking.advisor_id,
          student_id: booking.student_id,
          platform_fee_cents: String(platformFee),
        },
      },
      { idempotencyKey: `release-${booking.id}` }
    )

    await markReleased(admin, booking.id, {
      transferRef: transfer.id,
      method: "stripe",
      note: `Stripe ${transfer.id} → ${destination} · ${feeNote}`,
      now,
    })

    return { transferId: transfer.id, amount: advisorAmount, method: "stripe" }
  } catch (stripeError) {
    const message = stripeError instanceof Error ? stripeError.message : "Error al transferir con Stripe"
    console.error("[v0] Stripe transfer failed:", stripeError)
    await admin
      .from("payments")
      .update({ payout_method: "stripe", payout_note: `Fallo: ${message}` })
      .eq("booking_id", booking.id)
    return fail(message, true)
  }
}

async function markReleased(
  admin: ReturnType<typeof createServiceClient>,
  bookingId: string,
  info: { transferRef: string; method: "stripe" | "paypal"; note: string; now: string }
) {
  await admin
    .from("bookings")
    .update({
      stripe_transfer_id: info.transferRef,
      transfer_released_at: info.now,
      escrow_released_at: info.now,
      status: "completed",
    })
    .eq("id", bookingId)

  await admin
    .from("payments")
    .update({
      stripe_transfer_id: info.transferRef,
      status: "released",
      escrow_released_at: info.now,
      payout_method: info.method,
      payout_note: info.note,
    })
    .eq("booking_id", bookingId)
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
