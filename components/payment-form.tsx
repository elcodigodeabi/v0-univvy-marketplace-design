"use client"

import { useState } from "react"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Lock } from "lucide-react"

interface PaymentFormProps {
  bookingId: string
}

/**
 * Card / bank-transfer form rendered inside <Elements>. Shows Stripe's
 * error message inline (insufficient funds, declined card, network error,
 * etc.) and lets the student retry with the same PaymentIntent.
 */
export function PaymentForm({ bookingId }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setErrorMessage(null)

    const returnUrl = new URL(`/pago/${bookingId}`, window.location.origin)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: returnUrl.toString(),
      },
    })

    if (error) {
      // Stripe already localizes most of these messages; fall back to a
      // generic one for network / unexpected errors.
      setErrorMessage(
        error.message ||
          "No pudimos procesar tu pago. Verifica tus datos e intenta de nuevo."
      )
      setIsSubmitting(false)
      return
    }

    // Successful confirmations and pending bank-redirect methods (which stay
    // "processing" until the webhook confirms them) both land on the
    // success page, where the real status is fetched from the database.
    window.location.href = `/pago/exito?bookingId=${bookingId}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Pagar ahora
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Pago seguro procesado por Stripe. Tu dinero queda en garantía hasta
        que ambas partes confirmen que la clase se realizó.
      </p>
    </form>
  )
}
