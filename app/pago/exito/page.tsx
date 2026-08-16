"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight, MessageSquare, Loader2 } from "lucide-react"
import { getBookingReceipt } from "@/app/actions/bookings"
import { PaymentReceipt, type ReceiptData } from "@/components/payment-receipt"

export default function PagoExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      }
    >
      <PagoExitoContent />
    </Suspense>
  )
}

function PagoExitoContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) {
      setLoading(false)
      return
    }
    getBookingReceipt(bookingId)
      .then(setReceipt)
      .finally(() => setLoading(false))
  }, [bookingId])

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
        <div className="max-w-lg mx-auto space-y-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-10 text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago realizado con éxito</h1>
              <p className="text-gray-600">
                Tu sesión está confirmada. El pago queda en garantía hasta que ambas partes confirmen la clase.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                </div>
              )}
              {!loading && receipt && <PaymentReceipt receipt={receipt} />}
              {!loading && !receipt && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pudimos cargar el comprobante, pero tu sesión ya fue confirmada.
                </p>
              )}
            </CardContent>
          </Card>

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
