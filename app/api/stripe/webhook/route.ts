import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/service"
import Stripe from "stripe"

// Stripe requires the raw body for signature verification
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing stripe signature or webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error("[webhook] Signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {

      // ── Payment completed → move booking to confirmed + create escrow record
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_status !== "paid") break

        const bookingId = session.metadata?.booking_id
        if (!bookingId) break

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null

        // Idempotent: only update if still pending_payment
        const { data: booking } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            stripe_payment_intent_id: paymentIntentId,
            stripe_checkout_session_id: session.id,
          })
          .eq("id", bookingId)
          .eq("status", "pending_payment")
          .select()
          .single()

        if (booking) {
          // Upsert payment escrow record
          await supabase.from("payments").upsert(
            {
              booking_id: booking.id,
              payer_id: booking.student_id,
              payee_id: booking.advisor_id,
              amount: booking.price,
              platform_fee: booking.platform_fee,
              advisor_amount: booking.advisor_amount,
              currency: "EUR",
              status: "in_escrow",
              stripe_payment_intent_id: paymentIntentId,
              stripe_checkout_session_id: session.id,
            },
            { onConflict: "booking_id" }
          )
        }
        break
      }

      // ── Payment failed → keep as pending_payment or mark cancelled
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        const bookingId = pi.metadata?.booking_id
        if (!bookingId) break

        await supabase
          .from("bookings")
          .update({ status: "cancelled", cancellation_reason: "Pago fallido", cancelled_at: new Date().toISOString() })
          .eq("id", bookingId)
          .eq("status", "pending_payment")
        break
      }

      // ── Refund issued (from Stripe dashboard or our code) → update payment record
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const piId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id

        if (!piId) break

        await supabase
          .from("payments")
          .update({
            status: "refunded",
            refunded_at: new Date().toISOString(),
            refund_reason: "charge_refunded_via_stripe",
          })
          .eq("stripe_payment_intent_id", piId)

        await supabase
          .from("bookings")
          .update({ status: "refunded" })
          .eq("stripe_payment_intent_id", piId)
          .in("status", ["confirmed", "disputed"])
        break
      }

      // ── Transfer paid out (escrow released to advisor) → update payment record
      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer
        const bookingId = transfer.metadata?.booking_id
        if (!bookingId || transfer.metadata?.type !== "escrow_release") break

        await supabase
          .from("payments")
          .update({
            status: "released",
            stripe_transfer_id: transfer.id,
            escrow_released_at: new Date().toISOString(),
          })
          .eq("booking_id", bookingId)
        break
      }

      // ── Dispute opened on a payment → mark booking as disputed
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute
        const piId = typeof dispute.payment_intent === "string"
          ? dispute.payment_intent
          : dispute.payment_intent?.id

        if (!piId) break

        await supabase
          .from("bookings")
          .update({ status: "disputed" })
          .eq("stripe_payment_intent_id", piId)
        break
      }

      default:
        // Unhandled event types — just acknowledge
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("[webhook] Handler error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
