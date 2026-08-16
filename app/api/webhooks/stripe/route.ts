import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/service"
import { createNotification, createNotifications } from "@/lib/notifications"

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
  const webhookSecrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_WEBHOOK_SECRET_CONNECT,
  ].filter((secret, index, secrets): secret is string => Boolean(secret) && secrets.indexOf(secret) === index)

  if (webhookSecrets.length === 0) {
    console.error("[v0] No Stripe webhook secret is configured")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const body = await request.text()
  const stripe = getStripe()

  let event: Stripe.Event | undefined
  let signatureError: unknown
  for (const webhookSecret of webhookSecrets) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      break
    } catch (err) {
      signatureError = err
    }
  }

  if (!event) {
    console.error("[v0] Webhook signature verification failed:", signatureError)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const connectedAccountId = request.headers.get("stripe-account")
  if (connectedAccountId) {
    console.log(`[v0] Processing Connect webhook for ${connectedAccountId}: ${event.type}`)
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent
        const bookingId = pi.metadata?.booking_id
        const studentId = pi.metadata?.student_id
        const advisorId = pi.metadata?.advisor_id

        if (bookingId) {
          // Money captured and held on platform balance (escrow)
          const { data: updatedBookings } = await supabase
            .from("bookings")
            .update({ status: "confirmed" })
            .eq("id", bookingId)
            .in("status", ["pending_request", "pending_payment"])
            .select("id, subject, title")

          await supabase
            .from("payments")
            .update({ status: "in_escrow" })
            .eq("booking_id", bookingId)

          // Only notify on the transition we just made (avoids duplicate
          // notifications if Stripe retries the webhook delivery).
          if (updatedBookings && updatedBookings.length > 0 && studentId && advisorId) {
            const sessionLabel = updatedBookings[0].subject || updatedBookings[0].title || "tu sesión"
            await createNotifications([
              {
                userId: studentId,
                type: "payment_received",
                title: "Pago recibido",
                body: `Tu pago por ${sessionLabel} quedará en garantía hasta que ambos confirmen que la clase se realizó.`,
                data: { booking_id: bookingId },
              },
              {
                userId: advisorId,
                type: "booking_confirmed",
                title: "Nueva sesión confirmada y pagada",
                body: `Un alumno pagó y confirmó una sesión de ${sessionLabel}. El pago quedará en garantía hasta que ambos confirmen la clase.`,
                data: { booking_id: bookingId },
              },
            ])
          }
        }
        break
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        const bookingId = pi.metadata?.booking_id
        const studentId = pi.metadata?.student_id

        if (bookingId && studentId) {
          const reason = pi.last_payment_error?.message || "Ocurrió un error al procesar tu pago."
          await createNotification({
            userId: studentId,
            type: "system",
            title: "Tu pago no pudo procesarse",
            body: reason,
            data: { booking_id: bookingId },
          })
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
            .select("id, student_id, advisor_id, subject, title, status")
            .eq("stripe_payment_intent_id", piId)
            .single()

          if (booking) {
            // Only notify the first time this booking transitions to refunded
            // (avoids duplicate notifications on webhook retries).
            const alreadyRefunded = booking.status === "refunded"

            await supabase
              .from("bookings")
              .update({ status: "refunded" })
              .eq("id", booking.id)

            await supabase
              .from("payments")
              .update({ status: "refunded" })
              .eq("booking_id", booking.id)

            if (!alreadyRefunded) {
              const sessionLabel = booking.subject || booking.title || "tu sesión"
              await createNotifications([
                {
                  userId: booking.student_id,
                  type: "payment_released",
                  title: "Pago reembolsado",
                  body: `Tu pago por ${sessionLabel} fue reembolsado.`,
                  data: { booking_id: booking.id },
                },
                {
                  userId: booking.advisor_id,
                  type: "booking_cancelled",
                  title: "Pago reembolsado al alumno",
                  body: `El pago de ${sessionLabel} fue reembolsado al alumno.`,
                  data: { booking_id: booking.id },
                },
              ])
            }
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
