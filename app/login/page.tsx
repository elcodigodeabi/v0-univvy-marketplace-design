"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertCircle, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsVerification, setNeedsVerification] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNeedsVerification(false)
    setIsLoading(true)

    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setIsLoading(false)
      if (signInError.message.includes("Email not confirmed")) {
        setNeedsVerification(true)
        setError("Por favor, confirma tu correo electrónico antes de iniciar sesión.")
      } else if (signInError.message.includes("Invalid login credentials")) {
        setError("Correo o contraseña incorrectos.")
      } else {
        setError(signInError.message)
      }
      return
    }

    if (data.user) {
      toast.success("Inicio de sesión exitoso")
      const userType = data.user.user_metadata?.tipo || "alumno"
      router.push(userType === "asesor" ? "/dashboard-asesor" : "/dashboard")
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    const supabase = createClient()

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`,
      },
    })

    setIsResending(false)

    if (resendError) {
      toast.error("Error al reenviar el correo: " + resendError.message)
    } else {
      toast.success("Correo de verificación reenviado. Revisa tu bandeja de entrada.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <img src="/univvy-logo.png" alt="Univvy" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl text-center text-gray-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center text-gray-600">Ingresa a tu cuenta de Univvy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={isLoading}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-900">
                    Contraseña
                  </Label>
                  <Link href="/recuperar-password" className="text-sm text-red-600 hover:text-red-700">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {needsVerification && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-gray-300 bg-transparent"
                  onClick={handleResendVerification}
                  disabled={isResending}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {isResending ? "Enviando..." : "Reenviar correo de verificación"}
                </Button>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" className="text-red-600 hover:text-red-700 font-medium">
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
