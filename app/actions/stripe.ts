"use server"

import { stripe } from "@/lib/stripe"

interface CreateCheckoutSessionParams {
  sessionId: string
  tutorId: string
  tutorName: string
  subject: string
  priceInCents: number
  duration: number
  scheduledDate: string
  scheduledTime: string
  modality: "virtual" | "presencial"
  studentEmail?: string
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const {
    sessionId,
    tutorId,
    tutorName,
    subject,
    priceInCents,
    duration,
    scheduledDate,
    scheduledTime,
    modality,
    studentEmail,
  } = params

  try {
    // Calculate platform fee (10%)
    const platformFeeCents = Math.round(priceInCents * 0.1)
    const totalAmount = priceInCents + platformFeeCents

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pen",
            product_data: {
              name: `Asesoria: ${subject}`,
              description: `Sesion con ${tutorName} - ${scheduledDate} a las ${scheduledTime} (${modality})`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pago/exito?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: studentEmail,
      metadata: {
        session_id: sessionId,
        tutor_id: tutorId,
        subject,
        duration: duration.toString(),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        modality,
        platform_fee_cents: platformFeeCents.toString(),
        tutor_amount_cents: priceInCents.toString(),
      },
      payment_intent_data: {
        capture_method: "automatic",
        metadata: {
          session_id: sessionId,
          tutor_id: tutorId,
          escrow: "true",
          platform_fee_cents: platformFeeCents.toString(),
          tutor_amount_cents: priceInCents.toString(),
        },
      },
    })

    return { clientSecret: session.client_secret, sessionId: session.id }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw new Error("Failed to create checkout session")
  }
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    })
    return session
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    throw new Error("Failed to retrieve checkout session")
  }
}

export async function createPaymentIntent(params: {
  amount: number
  tutorId: string
  sessionId: string
}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: "pen",
      capture_method: "manual",
      metadata: {
        tutor_id: params.tutorId,
        session_id: params.sessionId,
        escrow: "true",
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw new Error("Failed to create payment intent")
  }
}

export async function capturePayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error("Error capturing payment:", error)
    throw new Error("Failed to capture payment")
  }
}

export async function refundPayment(paymentIntentId: string, reason?: string) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        reason: reason || "Session cancelled",
      },
    })
    return refund
  } catch (error) {
    console.error("Error refunding payment:", error)
    throw new Error("Failed to refund payment")
  }
}
