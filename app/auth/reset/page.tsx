"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, AlertCircle } from "lucide-react"

function parseSupabaseParams() {
  const hash = typeof window !== "undefined" ? window.location.hash.substring(1) : ""
  const search = typeof window !== "undefined" ? window.location.search.substring(1) : ""
  const hashParams = new URLSearchParams(hash)
  const queryParams = new URLSearchParams(search)

  return {
    accessToken: hashParams.get("access_token") || queryParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token") || queryParams.get("refresh_token") || "",
    type: hashParams.get("type") || queryParams.get("type") || "",
  }
}

export default function AuthResetPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const processToken = async () => {
      try {
        const { accessToken, refreshToken, type } = parseSupabaseParams()

        if (!accessToken || type !== "signup") {
          setStatus("error")
          setMessage("✗ No se pudo verificar el correo. El link puede haber expirado o ser inválido.")
          return
        }

        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          console.error("[auth/reset] setSession error:", sessionError.message)
          setStatus("error")
          setMessage("✗ No se pudo verificar el correo. El link puede haber expirado o ser inválido.")
          return
        }

        setStatus("success")
        setMessage("✓ Tu correo ha sido verificado con éxito. Ya puedes usar tu cuenta de univvy. Por favor, inicia sesión para continuar.")
      } catch (err) {
        console.error("[auth/reset] error:", err)
        setStatus("error")
        setMessage("✗ No se pudo verificar el correo. El link puede haber expirado o ser inválido.")
      }
    }

    processToken()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 animate-spin">
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">Verificando tu correo</h1>
              <p className="text-slate-600">Por favor espera mientras confirmamos tu cuenta.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Verificación completa</h1>
                <p className="mt-2 text-slate-600">{message}</p>
              </div>
              <Link href="/login" className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Iniciar sesión
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <h1 className="text-lg font-semibold text-red-900">Verificación fallida</h1>
                    <p className="mt-1 text-sm text-red-700">{message}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  Iniciar sesión
                </Link>
                <Link href="/registro" className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                  Registrarse
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
