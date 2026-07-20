import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/create-payment-intent
 * Body: { bookingId: string }
 *
 * Creates a PaymentIntent for a booking using "separate charges and transfers":
 * the platform charges the student now (escrow-style hold on the platform
 * balance) and transfers the advisor's net amount later via
 * /api/transfers/release once the class is confirmed.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { bookingId } = await request.json()
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId requerido" }, { status: 400 })
    }

    // Booking must belong to this student
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, student_id, advisor_id, price, status, stripe_payment_intent_id, subject")
      .eq("id", bookingId)
      .eq("student_id", user.id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    if (!["pending_request", "pending_payment", "confirmed"].includes(booking.status)) {
      return NextResponse.json(
        { error: "Esta reserva no admite pagos en su estado actual" },
        { status: 409 }
      )
    }

    // Advisor must have completed Stripe onboarding
    const { data: advisorProfile } = await supabase
      .from("profiles")
      .select("stripe_account_id, stripe_onboarding_complete")
      .eq("id", booking.advisor_id)
      .single()

    if (!advisorProfile?.stripe_account_id) {
      return NextResponse.json(
        { error: "El asesor aún no ha configurado sus pagos" },
        { status: 409 }
      )
    }

    const stripe = getStripe()

    // Reuse an existing PaymentIntent if present and still usable
    if (booking.stripe_payment_intent_id) {
      const existing = await stripe.paymentIntents.retrieve(
        booking.stripe_payment_intent_id
      )
      if (
        existing.status !== "canceled" &&
        existing.status !== "succeeded"
      ) {
        return NextResponse.json({
          clientSecret: existing.client_secret,
          paymentIntentId: existing.id,
        })
      }
    }

    // price is stored in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.price,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      // Funds stay on the platform balance (escrow-style).
      // The transfer to the advisor happens later via /api/transfers/release.
      metadata: {
        booking_id: booking.id,
        student_id: booking.student_id,
        advisor_id: booking.advisor_id,
        advisor_stripe_account: advisorProfile.stripe_account_id,
      },
    })

    // Persist the PaymentIntent id on booking + payment rows
    await supabase
      .from("bookings")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("id", booking.id)

    await supabase
      .from("payments")
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq("booking_id", booking.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("[v0] Create PaymentIntent error:", error)
    const message = error instanceof Error ? error.message : "Error interno"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
