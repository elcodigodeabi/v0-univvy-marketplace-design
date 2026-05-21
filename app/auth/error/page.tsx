"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, Clock, RefreshCw } from "lucide-react"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get("reason")

  const errorMessages: Record<string, { title: string; description: string; action: string }> = {
    invalid_code: {
      title: "Enlace Inválido",
      description: "El enlace de confirmación es inválido o ha expirado. Por favor, solicita un nuevo correo de confirmación.",
      action: "solicitar nuevo enlace"
    },
    no_code: {
      title: "Enlace Incompleto",
      description: "El enlace de confirmación está incompleto. Por favor, copia el enlace completo del correo.",
      action: "solicitar nuevo enlace"
    },
    no_user: {
      title: "Error de Verificación",
      description: "No pudimos verificar tu cuenta. Por favor, intenta nuevamente.",
      action: "intentar nuevamente"
    },
    server_error: {
      title: "Error del Servidor",
      description: "Ocurrió un error al procesar tu solicitud. Por favor, intenta más tarde.",
      action: "volver al inicio"
    },
  }

  const error = errorMessages[reason || "invalid_code"] || errorMessages.invalid_code

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <Card className="border-red-200 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900">{error.title}</CardTitle>
            <CardDescription className="text-center text-gray-600">
              {error.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reason === "invalid_code" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">Los enlaces expiran después de 24 horas. Si ya pasó ese tiempo, solicita uno nuevo.</p>
              </div>
            )}
            
            <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
              <Link href="/login" className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Ir a Iniciar Sesión
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-gray-300 bg-transparent">
              <Link href="/registro">No tienes cuenta? Regístrate</Link>
            </Button>

            {reason === "invalid_code" && (
              <Button asChild variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50">
                <Link href="/recuperar-password">Solicitar nuevo enlace</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
