"use server"

import { stripe, calculatePricing, CURRENCY } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

// ─── Create Stripe Checkout Session ───────────────────────────────────────
// Called by createBooking in bookings.ts after the booking row is saved.
export async function createStripeCheckoutSession(params: {
  bookingId: string
  advisorId: string
  advisorName: string
  studentEmail: string
  title: string
  description: string
  pricePerHour: number       // euros, e.g. 25
  durationMinutes: number
  cancelUrl: string
}) {
  const { advisorAmountCents, platformFeeCents, totalCents } = calculatePricing(
    params.pricePerHour,
    params.durationMinutes
  )

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Let Stripe pick the best payment methods for the user's location
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: params.title,
            description: params.description,
          },
          unit_amount: totalCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/pago/exito?checkout_session_id={CHECKOUT_SESSION_ID}&booking_id=${params.bookingId}`,
    cancel_url: params.cancelUrl,
    customer_email: params.studentEmail,
    metadata: {
      booking_id: params.bookingId,
      advisor_id: params.advisorId,
      advisor_name: params.advisorName,
      advisor_amount_cents: advisorAmountCents.toString(),
      platform_fee_cents: platformFeeCents.toString(),
      total_cents: totalCents.toString(),
    },
    payment_intent_data: {
      // Funds held in Stripe — we release manually via Transfer after escrow resolves
      metadata: {
        booking_id: params.bookingId,
        advisor_id: params.advisorId,
        escrow: "true",
      },
    },
  })

  return {
    checkoutUrl: session.url!,
    checkoutSessionId: session.id,
    advisorAmountCents,
    platformFeeCents,
    totalCents,
  }
}

// ─── Retrieve and verify a Checkout Session ───────────────────────────────
export async function getStripeCheckoutSession(checkoutSessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
    expand: ["payment_intent"],
  })
  return session
}

// ─── Release escrow to advisor (Stripe Transfer) ──────────────────────────
// Called when both parties confirm the session occurred.
export async function releaseEscrowToAdvisor(params: {
  bookingId: string
  paymentIntentId: string
  advisorStripeAccountId: string  // advisor's connected Stripe account
  advisorAmountCents: number
}) {
  // Create a Transfer from platform balance to advisor's connected account
  const transfer = await stripe.transfers.create({
    amount: params.advisorAmountCents,
    currency: CURRENCY,
    destination: params.advisorStripeAccountId,
    source_transaction: params.paymentIntentId,
    metadata: {
      booking_id: params.bookingId,
      type: "escrow_release",
    },
  })
  return transfer
}

// ─── Refund to student ────────────────────────────────────────────────────
// Called when session didn't occur (both confirm) or admin resolves dispute.
export async function refundToStudent(params: {
  paymentIntentId: string
  bookingId: string
  reason: "session_not_held" | "dispute_resolved_student" | "cancellation"
}) {
  const refund = await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    metadata: {
      booking_id: params.bookingId,
      reason: params.reason,
    },
  })
  return refund
}

// ─── Cancel booking before payment ───────────────────────────────────────
// If student hasn't paid yet, just expire the checkout session.
export async function expireCheckoutSession(checkoutSessionId: string) {
  try {
    await stripe.checkout.sessions.expire(checkoutSessionId)
  } catch {
    // Session may already be expired/completed — ignore
  }
}

// ─── Get advisor Stripe account status ───────────────────────────────────
// For future Stripe Connect onboarding flow.
export async function getOrCreateAdvisorStripeAccount(advisorId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, email, full_name")
    .eq("id", advisorId)
    .single()

  if (!profile) throw new Error("Perfil de asesor no encontrado")

  // If advisor already has a Stripe account, return it
  if (profile.stripe_account_id) {
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)
    return account
  }

  // Create a new Express account for the advisor
  const account = await stripe.accounts.create({
    type: "express",
    email: profile.email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      advisor_id: advisorId,
      platform: "univvy",
    },
  })

  // Save the account ID in the profiles table
  await supabase
    .from("profiles")
    .update({ stripe_account_id: account.id })
    .eq("id", advisorId)

  return account
}

// ─── Create Stripe Connect onboarding link ───────────────────────────────
export async function createStripeConnectOnboardingLink(advisorId: string) {
  const account = await getOrCreateAdvisorStripeAccount(advisorId)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${baseUrl}/asesor/onboarding?refresh=true`,
    return_url: `${baseUrl}/asesor/onboarding?success=true`,
    type: "account_onboarding",
  })

  return link.url
}
