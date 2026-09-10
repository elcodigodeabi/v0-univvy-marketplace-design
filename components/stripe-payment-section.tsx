"use client"

import { Elements } from "@stripe/react-stripe-js"
import { getStripeClient } from "@/lib/stripe-client"
import { PaymentForm } from "@/components/payment-form"

interface StripePaymentSectionProps {
  bookingId: string
  clientSecret: string
}

export function StripePaymentSection({ bookingId, clientSecret }: StripePaymentSectionProps) {
  return (
    <Elements
      stripe={getStripeClient()}
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
