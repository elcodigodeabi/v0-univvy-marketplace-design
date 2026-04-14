"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { getCheckoutSession } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, Clock, User, ArrowRight, Download, MessageSquare, Loader2 } from "lucide-react"

export default function PagoExitoPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const [sessionDetails, setSessionDetails] = useState<{
    tutorName: string
    subject: string
    date: string
    time: string
    amount: number
  } | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      if (sessionId) {
        try {
          const session = await getCheckoutSession(sessionId)
          setSessionDetails({
            tutorName: session.metadata?.tutor_name || "Maria Garcia",
            subject: session.metadata?.subject || "Calculo Diferencial",
            date: session.metadata?.scheduled_date || "2026-04-10",
            time: session.metadata?.scheduled_time || "10:00",
            amount: session.amount_total || 5500,
          })
        } catch (error) {
          console.error("Error fetching session:", error)
        }
      }
      setLoading(false)
    }
    fetchSession()
  }, [sessionId])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/univvy-logo.jpg"
              alt="Univvy"
              className="h-10 w-auto rounded-full border border-gray-100 shadow-sm"
            />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-200 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Pago Exitoso</CardTitle>
              <CardDescription className="text-base">
                Tu sesion de asesoria ha sido reservada correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sessionDetails && (
                <div className="bg-gray-50 rounded-lg p-6 text-left space-y-4">
                  <h3 className="font-semibold text-gray-900">Detalles de tu Sesion</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Asesor</p>
                        <p className="font-medium">{sessionDetails.tutorName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Fecha</p>
                        <p className="font-medium">{formatDate(sessionDetails.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Hora</p>
                        <p className="font-medium">{sessionDetails.time}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total pagado</span>
                      <span className="text-xl font-bold text-red-600">{formatPrice(sessionDetails.amount)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-800">
                  <strong>Tu pago esta protegido.</strong> El monto se mantendra en garantia hasta que completes la
                  sesion satisfactoriamente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="flex-1 bg-red-600 hover:bg-red-700">
                  <Link href="/mis-sesiones">
                    Ver Mis Sesiones
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/mensajes">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contactar Asesor
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-gray-500 pt-4">
                Hemos enviado un correo de confirmacion con todos los detalles de tu reserva.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
