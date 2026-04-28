"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { confirmBookingPayment } from "@/app/actions/bookings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  ArrowRight,
  MessageSquare,
  Loader2,
  Shield,
  MapPin,
  Video,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BookingDetails {
  id: string
  advisor_name: string
  student_name: string
  subject: string
  scheduled_at: string
  duration_minutes: number
  modalidad: string
  price: number
  platform_fee: number
  status: string
}

export default function PagoExitoPage() {
  const searchParams = useSearchParams()
  const checkoutSessionId = searchParams.get("checkout_session_id")
  const bookingId = searchParams.get("booking_id")

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirm = async () => {
      if (!checkoutSessionId || !bookingId) {
        setError("Faltan parámetros de la sesión de pago.")
        setLoading(false)
        return
      }
      try {
        const confirmed = await confirmBookingPayment({
          bookingId,
          checkoutSessionId,
        })
        if (confirmed) {
          setBooking({
            id: confirmed.id,
            advisor_name: confirmed.advisor_name || "Asesor",
            student_name: confirmed.student_name || "Estudiante",
            subject: confirmed.subject || confirmed.title || "Asesoría",
            scheduled_at: confirmed.scheduled_at,
            duration_minutes: confirmed.duration_minutes,
            modalidad: confirmed.modalidad,
            price: confirmed.price,
            platform_fee: confirmed.platform_fee,
            status: confirmed.status,
          })
        } else {
          setError("No se pudo confirmar el pago.")
        }
      } catch (err: any) {
        console.error("confirmBookingPayment error:", err)
        setError(err?.message || "Error al confirmar el pago.")
      } finally {
        setLoading(false)
      }
    }
    confirm()
  }, [checkoutSessionId, bookingId])

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (isoStr: string) => {
    return new Date(isoStr).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(cents / 100)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-gray-600 font-medium">Confirmando tu pago...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <Card className="border-red-200">
              <CardContent className="p-8">
                <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
                <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                  <Link href="/mis-sesiones">Ver mis sesiones</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Hero */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Pago exitoso</CardTitle>
              <CardDescription className="text-base text-gray-600">
                Tu sesion fue reservada y el pago esta en garantia
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Booking Details */}
          {booking && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Detalles de la reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Asesor</p>
                      <p className="font-semibold text-gray-900">{booking.advisor_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-semibold text-gray-900">{formatDate(booking.scheduled_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hora · Duración</p>
                      <p className="font-semibold text-gray-900">
                        {formatTime(booking.scheduled_at)} · {booking.duration_minutes} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {booking.modalidad === "virtual"
                        ? <Video className="h-5 w-5 text-red-600" />
                        : <MapPin className="h-5 w-5 text-red-600" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Modalidad</p>
                      <p className="font-semibold text-gray-900 capitalize">{booking.modalidad}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Asesoría (1 hora)</span>
                    <span>{formatPrice(booking.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Comisión plataforma (10%)</span>
                    <span>{formatPrice(booking.platform_fee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
                    <span>Total pagado</span>
                    <span className="text-red-600">{formatPrice(booking.price + booking.platform_fee)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Escrow explanation */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-5 flex gap-4">
              <Shield className="h-8 w-8 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Tu pago esta protegido</p>
                <p className="text-sm text-blue-800">
                  El monto queda en garantia hasta que ambas partes confirmen que la sesion se realizó.
                  Si hay algun problema, Univvy lo resuelve. El asesor recibe el pago solo cuando confirmas que la sesion ocurrió.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next steps */}
          <Card className="border-gray-200">
            <CardContent className="p-5">
              <p className="font-semibold text-gray-900 mb-3">Proximos pasos</p>
              <ol className="space-y-2 text-sm text-gray-700 list-none">
                {[
                  "El asesor recibira una notificacion con los detalles de la sesion",
                  "Conectate a la sesion a la hora acordada",
                  "Despues de la sesion, confirma que se realizo desde Mis Sesiones",
                  "El pago se liberara al asesor automaticamente",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-white text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </Badge>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white" size="lg">
              <Link href="/mis-sesiones">
                Ver mis sesiones
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-gray-300 bg-transparent" size="lg">
              <Link href="/mensajes">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contactar asesor
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
