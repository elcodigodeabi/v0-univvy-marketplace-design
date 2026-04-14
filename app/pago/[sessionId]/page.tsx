"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { createCheckoutSession } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, MapPin, User, BookOpen, Shield, CreditCard, Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SessionData {
  id: string
  tutorId: string
  tutorName: string
  tutorAvatar: string | null
  subject: string
  priceInCents: number
  duration: number
  scheduledDate: string
  scheduledTime: string
  modality: "virtual" | "presencial"
  studentEmail: string
}

export default function PagoPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)

  useEffect(() => {
    const initCheckout = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        
        // Try to fetch session data from database
        const { data: booking, error: fetchError } = await supabase
          .from("bookings")
          .select("*")
          .eq("id", params.sessionId)
          .single()

        let session: SessionData
        
        if (booking && !fetchError) {
          session = {
            id: booking.id,
            tutorId: booking.asesor_id,
            tutorName: booking.asesor_nombre || "Asesor",
            tutorAvatar: null,
            subject: booking.subject || "Asesoría",
            priceInCents: booking.price || 5000,
            duration: booking.duration ? parseInt(booking.duration) : 60,
            scheduledDate: booking.scheduled_date,
            scheduledTime: booking.scheduled_time,
            modality: booking.modality || "virtual",
            studentEmail: user?.email || "",
          }
        } else {
          // Fallback session data for demo purposes
          session = {
            id: params.sessionId as string,
            tutorId: "demo-tutor",
            tutorName: "Asesor",
            tutorAvatar: null,
            subject: "Asesoría",
            priceInCents: 5000,
            duration: 60,
            scheduledDate: new Date().toISOString().split("T")[0],
            scheduledTime: "10:00",
            modality: "virtual",
            studentEmail: user?.email || "",
          }
        }
        
        setSessionData(session)

        const result = await createCheckoutSession({
          sessionId: session.id,
          tutorId: session.tutorId,
          tutorName: session.tutorName,
          subject: session.subject,
          priceInCents: session.priceInCents,
          duration: session.duration,
          scheduledDate: session.scheduledDate,
          scheduledTime: session.scheduledTime,
          modality: session.modality,
          studentEmail: session.studentEmail,
        })
        setClientSecret(result.clientSecret)
      } catch (err) {
        console.error("[v0] Error initializing checkout:", err)
        setError("Error al iniciar el proceso de pago. Por favor intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    initCheckout()
  }, [params.sessionId, user?.email])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPrice = (cents: number) => {
    return `S/${(cents / 100).toFixed(2)}`
  }

  if (loading || !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <Link href="/" className="flex items-center gap-2">
                  <img
                    src="/univvy-logo.jpg"
                    alt="Univvy"
                    className="h-10 w-auto rounded-full border border-gray-100 shadow-sm"
                  />
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
            <p className="text-gray-600">Cargando información de pago...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/univvy-logo.jpg"
                  alt="Univvy"
                  className="h-10 w-auto rounded-full border border-gray-100 shadow-sm"
                />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Pago seguro con Stripe</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Completar Pago</h1>
            <p className="text-gray-600">Confirma los detalles y realiza el pago de tu asesoria</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen de la Sesion</CardTitle>
                  <CardDescription>Detalles de tu asesoria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tutor Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      {sessionData.tutorAvatar ? (
                        <img
                          src={sessionData.tutorAvatar}
                          alt={sessionData.tutorName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sessionData.tutorName}</p>
                      <p className="text-sm text-gray-500">Asesor verificado</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Session Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Materia:</span>
                      <span className="font-medium text-gray-900">{sessionData.subject}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium text-gray-900">{formatDate(sessionData.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Hora:</span>
                      <span className="font-medium text-gray-900">{sessionData.scheduledTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Duracion:</span>
                      <span className="font-medium text-gray-900">{sessionData.duration} minutos</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Modalidad:</span>
                      <Badge variant="outline" className="capitalize">
                        {sessionData.modality}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(sessionData.priceInCents)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Comision de servicio</span>
                      <span>{formatPrice(Math.round(sessionData.priceInCents * 0.1))}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-red-600">
                        {formatPrice(sessionData.priceInCents + Math.round(sessionData.priceInCents * 0.1))}
                      </span>
                    </div>
                  </div>

                  {/* Escrow Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-800 text-sm">Pago Protegido</p>
                        <p className="text-xs text-green-700 mt-1">
                          Tu pago se mantendra en garantia hasta que completes la sesion. Si no estas satisfecho, puedes
                          solicitar un reembolso.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stripe Checkout */}
            <div className="lg:col-span-3">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Informacion de Pago
                  </CardTitle>
                  <CardDescription>Ingresa los datos de tu tarjeta de forma segura</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
                      <p className="text-gray-600">Cargando formulario de pago...</p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-800">{error}</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.location.reload()}
                      >
                        Intentar de nuevo
                      </Button>
                    </div>
                  )}

                  {clientSecret && (
                    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
