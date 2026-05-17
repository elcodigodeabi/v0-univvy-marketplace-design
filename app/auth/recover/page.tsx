"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, AlertCircle } from "lucide-react"

export default function RecoveryPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const processRecovery = async () => {
      try {
        const supabase = createClient()
        
        // Get the session from URL fragment
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const accessToken = params.get("access_token")
        const type = params.get("type")

        if (!accessToken || type !== "recovery") {
          setError("El enlace de recuperación es inválido o ha expirado")
          setIsProcessing(false)
          return
        }

        // Set the session with the recovery token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get("refresh_token") || "",
        })

        if (sessionError) {
          setError("No pudimos verificar tu enlace. Por favor intenta de nuevo.")
          setIsProcessing(false)
          return
        }

        // Redirect to password change page
        setIsProcessing(false)
        router.push("/nueva-password")
      } catch (err) {
        console.error("[v0] Recovery error:", err)
        setError("Ocurrió un error al procesar tu solicitud")
        setIsProcessing(false)
      }
    }

    processRecovery()
  }, [router])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-red-600 animate-spin mx-auto" />
          <h1 className="text-xl font-semibold text-gray-900">Procesando tu solicitud...</h1>
          <p className="text-gray-600">Por favor espera mientras procesamos tu enlace de recuperación</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex gap-3 mb-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h1 className="text-lg font-semibold text-red-900 mb-1">Enlace Inválido</h1>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <a
                href="/recuperar-password"
                className="block text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Solicitar nuevo enlace
              </a>
              <a
                href="/login"
                className="block text-center bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Volver a Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
