"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Elements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Shield,
  Video,
  AlertCircle,
} from "lucide-react"
import { getBookingForPayment } from "@/app/actions/bookings"
import { getStripeClient } from "@/lib/stripe-client"
import { PaymentForm } from "@/components/payment-form"

type BookingSummary = Awaited<ReturnType<typeof getBookingForPayment>>

export default function PagoPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.sessionId as string

  const [booking, setBooking] = useState<BookingSummary | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const summary = await getBookingForPayment(bookingId)
        if (!isMounted) return
        setBooking(summary)

        // Already paid — send the student straight to the receipt.
        if (["in_escrow", "released"].includes(summary.paymentStatus)) {
          router.replace(`/pago/exito?bookingId=${bookingId}`)
          return
        }

        if (!["pending_request", "pending_payment", "confirmed"].includes(summary.status)) {
          setError("Esta reserva ya no admite pagos.")
          setLoading(false)
          return
        }

        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "No se pudo iniciar el pago")
        }

        if (!isMounted) return
        setClientSecret(data.clientSecret)
      } catch (err: any) {
        if (!isMounted) return
        setError(err?.message || "Error al cargar la reserva")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [bookingId, router])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
  const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(cents / 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mis-sesiones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Mis sesiones
            </Link>
          </Button>
          <Link href="/">
            <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
            <p className="text-gray-600">Preparando tu pago...</p>
          </div>
        )}

        {!loading && error && (
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-gray-900 font-medium">{error}</p>
              <Button asChild variant="outline">
                <Link href="/mis-sesiones">Volver a mis sesiones</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && booking && (
          <div className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Resumen de tu reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={booking.advisor?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-red-100 text-red-600">
                      {(booking.advisor?.full_name || "AS").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.advisor?.full_name || "Asesor"}</p>
                    <p className="text-sm text-gray-600">{booking.subject || booking.title}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-600" />
                    {formatDate(booking.scheduledAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    {formatTime(booking.scheduledAt)} · {booking.durationMinutes} min
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    {booking.modalidad === "virtual" ? (
                      <>
                        <Video className="h-4 w-4 text-red-600" />
                        Virtual
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-red-600" />
                        Presencial
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total a pagar</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(booking.price, booking.currency)}
                  </span>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Tu pago queda retenido en garantía. Se libera al asesor solo cuando ambos confirmen
                    que la clase se realizó. Si no ocurre, te lo reembolsamos.
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Método de pago</CardTitle>
              </CardHeader>
              <CardContent>
                {clientSecret ? (
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
                ) : (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
