"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, ArrowLeft, Mail, RotateCcw } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants"

export default function PagoCanceladoPage() {
  return (
    <Suspense>
      <PagoCanceladoContent />
    </Suspense>
  )
}

function PagoCanceladoContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const reason = searchParams.get("reason")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/univvy-logo.png" alt="Univvy" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-gray-200 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">No se pudo completar el pago</CardTitle>
              <CardDescription className="text-base">
                {reason || "El proceso de pago fue cancelado o falló. No se ha realizado ningún cargo."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Puedes intentarlo nuevamente con otra tarjeta o método de pago, o contactar a nuestro
                equipo de soporte si el problema persiste.
              </p>

              <div className="flex flex-col gap-3">
                {bookingId ? (
                  <Button asChild className="bg-red-600 hover:bg-red-700">
                    <Link href={`/pago/${bookingId}`}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reintentar pago
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="bg-red-600 hover:bg-red-700">
                    <Link href="/mis-sesiones">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Ir a mis sesiones
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <a href={`mailto:${SITE_CONFIG.contact.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contactar Soporte
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
