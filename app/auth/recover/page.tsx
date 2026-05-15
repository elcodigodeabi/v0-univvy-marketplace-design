"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

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

        console.log("[v0] Recovery page - Token type:", type, "Has token:", !!accessToken)

        if (!accessToken || type !== "recovery") {
          setError("El enlace de recuperación es inválido o ha expirado")
          setIsProcessing(false)
          return
        }

        // Set the session with the recovery token
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get("refresh_token") || "",
        })

        console.log("[v0] Set session result:", { hasData: !!data, hasError: !!sessionError })

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-red-600 animate-spin mx-auto" />
          <p className="text-gray-600">Procesando enlace de recuperación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-900 mb-2">Enlace Inválido</h1>
            <p className="text-red-700 mb-4">{error}</p>
            <a
              href="/recuperar-password"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Solicitar nuevo enlace
            </a>
          </div>
        </div>
      </div>
    )
  }

  return null
}
