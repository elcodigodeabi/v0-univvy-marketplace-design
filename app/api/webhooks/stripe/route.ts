import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/service"

/**
 * POST /api/webhooks/stripe
 * Validates the Stripe signature with STRIPE_WEBHOOK_SECRET and handles:
 * - payment_intent.succeeded  → mark booking/payment as paid (held in escrow)
 * - transfer.created          → record the transfer id
 * - charge.refunded           → mark payment refunded, booking refunded
 * - account.updated           → mark advisor onboarding complete
 *
 * Uses the Supabase service-role client because webhooks have no user session.
 */
export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[v0] STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const body = await request.text()
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[v0] Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent
        const bookingId = pi.metadata?.booking_id

        if (bookingId) {
          // Money captured and held on platform balance (escrow)
          await supabase
            .from("bookings")
            .update({ status: "confirmed" })
            .eq("id", bookingId)
            .in("status", ["pending_request", "pending_payment"])

          await supabase
            .from("payments")
            .update({ status: "held" })
            .eq("booking_id", bookingId)
        }
        break
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer
        const bookingId = transfer.metadata?.booking_id

        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ stripe_transfer_id: transfer.id })
            .eq("id", bookingId)

          await supabase
            .from("payments")
            .update({ stripe_transfer_id: transfer.id, status: "released" })
            .eq("booking_id", bookingId)
        }
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const piId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id

        if (piId) {
          const { data: booking } = await supabase
            .from("bookings")
            .select("id")
            .eq("stripe_payment_intent_id", piId)
            .single()

          if (booking) {
            await supabase
              .from("bookings")
              .update({ status: "refunded" })
              .eq("id", booking.id)

            await supabase
              .from("payments")
              .update({ status: "refunded" })
              .eq("booking_id", booking.id)
          }
        }
        break
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account
        const userId = account.metadata?.supabase_user_id

        const onboardingComplete =
          account.details_submitted === true &&
          account.payouts_enabled === true

        if (userId) {
          await supabase
            .from("profiles")
            .update({ stripe_onboarding_complete: onboardingComplete })
            .eq("id", userId)
        } else {
          // Fallback: look up by account id
          await supabase
            .from("profiles")
            .update({ stripe_onboarding_complete: onboardingComplete })
            .eq("stripe_account_id", account.id)
        }
        break
      }

      default:
        // Unhandled event types are acknowledged without action
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
