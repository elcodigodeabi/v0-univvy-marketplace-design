"use client"

import { Elements } from "@stripe/react-stripe-js"
import { getStripeClient } from "@/lib/stripe-client"
import { PaymentForm } from "@/components/payment-form"

interface StripePaymentSectionProps {
  bookingId: string
  clientSecret: string
}

export function StripePaymentSection({ bookingId, clientSecret }: StripePaymentSectionProps) {
  const stripe = getStripeClient()

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
        <p className="font-medium text-foreground">Stripe no está disponible</p>
        <p className="mt-1 text-muted-foreground">Usa PayPal para completar el pago.</p>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: "#dc2626" },
        },
      }}
    >
      <PaymentForm bookingId={bookingId} />
    </Elements>
  )
}
