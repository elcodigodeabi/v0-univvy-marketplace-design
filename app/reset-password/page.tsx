"use client"

import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, AlertCircle, Lock } from "lucide-react"

function parseSupabaseParams() {
  const hash = typeof window !== "undefined" ? window.location.hash.substring(1) : ""
  const search = typeof window !== "undefined" ? window.location.search.substring(1) : ""
  const hashParams = new URLSearchParams(hash)
  const queryParams = new URLSearchParams(search)

  return {
    accessToken: hashParams.get("access_token") || queryParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token") || queryParams.get("refresh_token") || "",
    code: queryParams.get("code") || hashParams.get("code"),
    type: hashParams.get("type") || queryParams.get("type") || "",
  }
}

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const processToken = async () => {
      try {
        const { accessToken, refreshToken, code, type } = parseSupabaseParams()
        const supabase = createClient()

        if (accessToken && type === "recovery") {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error("[reset-password] setSession error:", sessionError.message)
            setStatus("error")
            setMessage("✗ Algo salió mal. El link puede haber expirado. Intenta de nuevo desde la página de login.")
            return
          }

          setStatus("ready")
          return
        }

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError || !data?.user) {
            console.error("[reset-password] exchangeCodeForSession error:", exchangeError?.message, data)
            setStatus("error")
            setMessage("✗ Algo salió mal. El link puede haber expirado. Intenta de nuevo desde la página de login.")
            return
          }

          setStatus("ready")
          return
        }

        setStatus("error")
        setMessage("✗ Algo salió mal. El link puede haber expirado. Intenta de nuevo desde la página de login.")
      } catch (err) {
        console.error("[reset-password] error:", err)
        setStatus("error")
        setMessage("✗ Algo salió mal. El link puede haber expirado. Intenta de nuevo desde la página de login.")
      }
    }

    processToken()
  }, [])

  const passwordsMatch = password === confirmPassword && password.length > 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!passwordsMatch) {
      setMessage("✗ Las contraseñas deben coincidir.")
      setStatus("error")
      return
    }

    setIsSaving(true)
    setMessage("")

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setIsSaving(false)

    if (error) {
      console.error("[reset-password] updateUser error:", error.message)
      setStatus("error")
      setMessage("✗ Algo salió mal. El link puede haber expirado. Intenta de nuevo desde la página de login.")
      return
    }

    setStatus("success")
    setMessage("✓ Se ha restablecido tu contraseña con éxito. Por favor, inicia sesión en univvy para continuar.")

    try {
      await supabase.auth.signOut()
    } catch {
      // no-op
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-red-600 text-white p-3">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Restablecer contraseña</h1>
              <p className="text-sm text-slate-600">Ingresa una nueva contraseña segura para tu cuenta.</p>
            </div>
          </div>

          {status === "loading" && (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-600 animate-spin">
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
              </div>
              <p className="mt-4 text-slate-700">Procesando tu enlace de recuperación...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="text-red-900 font-semibold">Error al restablecer la contraseña</p>
                    <p className="mt-1 text-sm text-red-700">{message}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/login" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  Volver a iniciar sesión
                </Link>
                <Link href="/registro" className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                  Solicitar nuevo enlace
                </Link>
              </div>
            </div>
          )}

          {status === "ready" && (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-900">
                  Nueva contraseña
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-900">
                  Confirmar contraseña
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving || !passwordsMatch || password.length === 0}
                className="inline-flex w-full items-center justify-center rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isSaving ? "Restableciendo..." : "Restablecer contraseña"}
              </button>
            </form>
          )}

          {status === "success" && (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-green-900">{message}</p>
              <p className="mt-2 text-sm text-slate-600">Por favor, inicia sesión en univvy para continuar.</p>
              <Link href="/login" className="mt-6 inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
