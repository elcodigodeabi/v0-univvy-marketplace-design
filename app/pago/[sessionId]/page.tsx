"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Calendar } from "lucide-react"

export default function PagoPage() {
  const params = useParams()

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

      <main className="container mx-auto px-4 py-16 max-w-lg text-center">
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Reserva confirmada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Tu sesión ha sido agendada correctamente. Puedes ver los detalles en Mis sesiones.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/mis-sesiones">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver mis sesiones
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/buscar">Buscar más asesores</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
