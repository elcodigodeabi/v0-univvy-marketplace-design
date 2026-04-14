"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react"

export default function PagoCanceladoPage() {
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
        <div className="max-w-md mx-auto">
          <Card className="border-gray-200 text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Pago Cancelado</CardTitle>
              <CardDescription className="text-base">
                El proceso de pago fue cancelado. No se ha realizado ningun cargo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Si tuviste algun problema durante el proceso de pago, puedes intentarlo nuevamente o contactar a
                nuestro equipo de soporte.
              </p>

              <div className="flex flex-col gap-3">
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/asesores">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Buscar Asesores
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/ayuda">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Contactar Soporte
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
