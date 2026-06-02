"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Lock, CheckCircle, XCircle, Eye, EyeOff, Check, X, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { SITE_CONFIG } from "@/lib/constants"

type PageState = "loading" | "ready" | "invalid" | "success"

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? "h-5 w-5"}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function ValidationItem({ passed, text }: { passed: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${passed ? "text-green-600" : "text-gray-500"}`}>
      {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  )
}

export default function NuevaPasswordPage() {
  const [pageState, setPageState] = useState<PageState>("loading")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  // Listen for the PASSWORD_RECOVERY event from the hash fragment
  // Supabase automatically parses #access_token=...&type=recovery from the URL
  useEffect(() => {
    const supabase = createClient()

    // Set a timeout: if no recovery event fires within 5s, mark as invalid
    const timeout = setTimeout(() => {
      setPageState((prev) => (prev === "loading" ? "invalid" : prev))
    }, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Recovery session is now active — show the form
        clearTimeout(timeout)
        setPageState("ready")
      } else if (event === "SIGNED_IN" && session) {
        // Some Supabase versions emit SIGNED_IN instead of PASSWORD_RECOVERY
        clearTimeout(timeout)
        setPageState("ready")
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const passwordValidations = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const allValidationsPassed = Object.values(passwordValidations).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!allValidationsPassed) {
      toast.error("Contraseña inválida", {
        description: "La contraseña no cumple con todos los requisitos.",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
      })
      return
    }

    if (!passwordsMatch) {
      toast.error("Las contraseñas no coinciden", {
        description: "Por favor verifica que ambas contraseñas sean iguales.",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
      })
      return
    }

    setIsSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setIsSubmitting(false)

    if (error) {
      toast.error("Error al actualizar contraseña", {
        description: error.message,
        icon: <XCircle className="h-5 w-5 text-red-600" />,
      })
      return
    }

    setPageState("success")
    toast.success("Contraseña actualizada", {
      description: "Tu contraseña ha sido cambiada exitosamente.",
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    })

    setTimeout(() => {
      router.push("/login")
    }, 3000)
  }

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
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900">Nueva Contraseña</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Crea una nueva contraseña segura para tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* LOADING: waiting for the recovery session from hash */}
            {pageState === "loading" && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <Spinner className="h-8 w-8 text-red-600" />
                <p className="text-sm text-gray-600">Verificando enlace de recuperación...</p>
              </div>
            )}

            {/* INVALID: token missing, expired, or already used */}
            {pageState === "invalid" && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Enlace inválido o expirado</p>
                  <p className="text-sm text-gray-600">
                    El enlace de recuperación ya fue usado o expiró. Solicita uno nuevo.
                  </p>
                </div>
                <Link href="/recuperar-password">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Solicitar nuevo enlace
                  </Button>
                </Link>
              </div>
            )}

            {/* READY: show the new password form */}
            {pageState === "ready" && (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="border-gray-300 pr-10"
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
                </div>

                {/* Password requirements */}
                <div className="space-y-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Requisitos:</p>
                  <ValidationItem passed={passwordValidations.minLength} text="Mínimo 8 caracteres" />
                  <ValidationItem passed={passwordValidations.hasUppercase} text="Al menos una mayúscula" />
                  <ValidationItem passed={passwordValidations.hasLowercase} text="Al menos una minúscula" />
                  <ValidationItem passed={passwordValidations.hasNumber} text="Al menos un número" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-900">
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className={`border-gray-300 pr-10 ${
                        confirmPassword && !passwordsMatch ? "border-red-500 focus-visible:ring-red-500" : ""
                      } ${passwordsMatch ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Las contraseñas no coinciden
                    </p>
                  )}
                  {passwordsMatch && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Las contraseñas coinciden
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isSubmitting || !allValidationsPassed || !passwordsMatch}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="h-4 w-4" />
                      Guardando...
                    </span>
                  ) : (
                    "Cambiar Contraseña"
                  )}
                </Button>
              </form>
            )}

            {/* SUCCESS */}
            {pageState === "success" && (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Contraseña actualizada</p>
                  <p className="text-sm text-gray-600">
                    Ya puedes iniciar sesión con tu nueva contraseña.
                  </p>
                  <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión...</p>
                </div>
                <Spinner className="h-5 w-5 text-red-600" />
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              ¿Necesitas ayuda?{" "}
              <a
                href={`mailto:${SITE_CONFIG.contact.email}`}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Contacta soporte
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
