"use client"

import type React from "react"
import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Lock, CheckCircle, XCircle, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

// ─── Shared spinner ───────────────────────────────────────────────────────────
function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? "h-4 w-4"}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// ─── Main content (needs useSearchParams, so must be inside Suspense) ─────────
type PageView = "request-email" | "email-sent" | "invalid-code" | "new-password" | "password-changed"

function RecuperarPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get("mode")   // "update" = session ready, show new-password form
  const error = searchParams.get("error") // "invalid_link" = callback failed

  const initialView = (): PageView => {
    if (mode === "update") return "new-password"
    if (error === "invalid_link") return "invalid-code"
    return "request-email"
  }

  const [view, setView] = useState<PageView>(initialView)

  // ── Email request state ──
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)

  // ── New password state ──
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmError, setConfirmError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ── Request reset email ─────────────────────────────────────────────────────
  const handleRequestEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Correo inválido", {
        description: "Por favor ingresa un correo electrónico válido.",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
      })
      return
    }

    setIsSending(true)
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://univvyorg.com"
    // redirectTo must point to the server-side callback which exchanges the code
    // and then redirects to /recuperar-password?mode=update
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/recuperar-password`,
    })
    setIsSending(false)

    if (sendError) {
      toast.error("Error al enviar el correo", {
        description: sendError.message,
        icon: <XCircle className="h-5 w-5 text-red-600" />,
      })
      return
    }

    setView("email-sent")
    toast.success("Correo enviado", {
      description: `Se envió un enlace de recuperación a ${email}`,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    })
  }

  // ── Update password ─────────────────────────────────────────────────────────
  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    let valid = true
    setPasswordError("")
    setConfirmError("")

    if (password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres.")
      valid = false
    }
    if (password !== confirmPassword) {
      setConfirmError("Las contraseñas no coinciden.")
      valid = false
    }
    if (!valid) return

    setIsSaving(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setIsSaving(false)

    if (updateError) {
      toast.error("Error al actualizar contraseña", {
        description: updateError.message,
        icon: <XCircle className="h-5 w-5 text-red-600" />,
      })
      return
    }

    setView("password-changed")
    toast.success("Contraseña actualizada", {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    })
    setTimeout(() => router.push("/login"), 3000)
  }

  // ── Shared card wrapper ─────────────────────────────────────────────────────
  const iconBg =
    view === "new-password" || view === "password-changed"
      ? <Lock className="h-6 w-6 text-white" />
      : <Mail className="h-6 w-6 text-white" />

  const cardTitle =
    view === "new-password" ? "Nueva Contraseña" :
    view === "invalid-code" ? "Enlace inválido" :
    view === "password-changed" ? "Contraseña actualizada" :
    "Recuperar Contraseña"

  const cardDesc =
    view === "new-password" ? "Crea una nueva contraseña para tu cuenta." :
    view === "invalid-code" ? "El enlace expiró o ya fue utilizado." :
    view === "password-changed" ? "Tu contraseña fue cambiada exitosamente." :
    "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña."

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center">
                {iconBg}
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900">{cardTitle}</CardTitle>
            <CardDescription className="text-center text-gray-600">{cardDesc}</CardDescription>
          </CardHeader>

          <CardContent>
            {/* ── Invalid / expired code ── */}
            {view === "invalid-code" && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="h-14 w-14 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-amber-600" />
                </div>
                <p className="text-sm text-gray-600">
                  El enlace expiró o ya fue usado. Solicitá uno nuevo ingresando tu correo.
                </p>
                <Button
                  onClick={() => setView("request-email")}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Solicitar nuevo enlace
                </Button>
              </div>
            )}

            {/* ── Request email form ── */}
            {view === "request-email" && (
              <form onSubmit={handleRequestEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@universidad.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSending}
                    className="border-gray-300"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isSending || !email}
                >
                  {isSending ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Enviando...
                    </span>
                  ) : (
                    "Enviar enlace de recuperación"
                  )}
                </Button>
              </form>
            )}

            {/* ── Email sent confirmation ── */}
            {view === "email-sent" && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">Correo enviado</p>
                  <p className="text-sm text-gray-600">
                    Enviamos un enlace de recuperación a{" "}
                    <span className="font-medium text-gray-900">{email}</span>.
                  </p>
                  <p className="text-sm text-gray-500">Revisá tu bandeja de entrada y seguí las instrucciones.</p>
                </div>
              </div>
            )}

            {/* ── New password form ── */}
            {view === "new-password" && (
              <form onSubmit={handleNewPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900">
                    Nueva Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError("") }}
                      required
                      disabled={isSaving}
                      className={`border-gray-300 pr-10 ${passwordError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
                  <p className="text-xs text-gray-500">Mínimo 8 caracteres.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError("") }}
                      required
                      disabled={isSaving}
                      className={`border-gray-300 pr-10 ${confirmError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmError && <p className="text-xs text-red-600">{confirmError}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isSaving || !password || !confirmPassword}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Spinner /> Guardando...
                    </span>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </Button>
              </form>
            )}

            {/* ── Password changed success ── */}
            {view === "password-changed" && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">Contraseña actualizada</p>
                  <p className="text-sm text-gray-600">Ya podés iniciar sesión con tu nueva contraseña.</p>
                  <p className="text-sm text-gray-500">Redirigiendo...</p>
                </div>
                <Spinner className="h-5 w-5 text-red-600" />
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
                Iniciá sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Page export with Suspense (required for useSearchParams) ─────────────────
export default function RecuperarPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-red-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      }
    >
      <RecuperarPasswordContent />
    </Suspense>
  )
}
