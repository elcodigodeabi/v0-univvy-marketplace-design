"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Lock, CheckCircle, XCircle, Eye, EyeOff, Check, X } from "lucide-react"
import { toast } from "sonner"

function NuevaPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  // Validaciones de contraseña
  const passwordValidations = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
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

    setIsLoading(true)

    // Simulación de cambio de contraseña (sin backend)
    setTimeout(() => {
      setIsLoading(false)
      setPasswordChanged(true)

      toast.success("Contraseña actualizada", {
        description: "Tu contraseña ha sido cambiada exitosamente.",
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      })

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to login link */}
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
              {email ? (
                <>Crea una nueva contraseña para <span className="font-medium text-gray-900">{email}</span></>
              ) : (
                "Crea una nueva contraseña segura para tu cuenta"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!passwordChanged ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nueva contraseña */}
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
                      disabled={isLoading}
                      className="border-gray-300 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Validaciones de contraseña */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Requisitos de contraseña:</p>
                  <div className="grid grid-cols-1 gap-1">
                    <ValidationItem passed={passwordValidations.minLength} text="Mínimo 8 caracteres" />
                    <ValidationItem passed={passwordValidations.hasUppercase} text="Al menos una mayúscula" />
                    <ValidationItem passed={passwordValidations.hasLowercase} text="Al menos una minúscula" />
                    <ValidationItem passed={passwordValidations.hasNumber} text="Al menos un número" />
                    <ValidationItem passed={passwordValidations.hasSpecial} text="Al menos un carácter especial" />
                  </div>
                </div>

                {/* Confirmar contraseña */}
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
                      disabled={isLoading}
                      className={`border-gray-300 pr-10 ${
                        confirmPassword && !passwordsMatch ? "border-red-500 focus-visible:ring-red-500" : ""
                      } ${passwordsMatch ? "border-green-500 focus-visible:ring-green-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                  disabled={isLoading || !allValidationsPassed || !passwordsMatch}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    "Cambiar Contraseña"
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">Contraseña actualizada</p>
                  <p className="text-sm text-gray-600">
                    Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                  </p>
                  <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión...</p>
                </div>
                <div className="flex justify-center">
                  <svg className="animate-spin h-5 w-5 text-red-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              ¿Necesitas ayuda?{" "}
              <Link href="/" className="text-red-600 hover:text-red-700 font-medium">
                Contacta soporte
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-red-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <NuevaPasswordContent />
    </Suspense>
  )
}

// loading.tsx
// export default function Loading() {
//   return null
// }
