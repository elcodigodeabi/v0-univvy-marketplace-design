"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight, MessageSquare } from "lucide-react"

export default function PagoExitoPage() {
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
        <div className="max-w-lg mx-auto space-y-6 text-center">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-10">
              <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sesion agendada</h1>
              <p className="text-gray-600">Tu sesion fue reservada correctamente. Puedes verla en Mis Sesiones.</p>
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
