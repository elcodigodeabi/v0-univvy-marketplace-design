"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      toast.error("Correo inválido", {
        description: "Por favor ingresa un correo electrónico válido.",
        icon: <XCircle className="h-5 w-5 text-red-600" />,
      })
      return
    }

    setIsLoading(true)

    // Simulación de envío de correo (sin backend)
    setTimeout(() => {
      setIsLoading(false)
      setEmailSent(true)
      
      toast.success("Correo enviado exitosamente", {
        description: `Se ha enviado un enlace de recuperación a ${email}`,
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      })

      // Redirigir a la página de nueva contraseña después de 2 segundos
      setTimeout(() => {
        router.push(`/nueva-password?email=${encodeURIComponent(email)}`)
      }, 2000)
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
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
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

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white" 
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Enviar enlace de recuperación"
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
                  <p className="text-gray-900 font-medium">Correo enviado</p>
                  <p className="text-sm text-gray-600">
                    Hemos enviado un enlace de recuperación a <span className="font-medium text-gray-900">{email}</span>
                  </p>
                  <p className="text-sm text-gray-500">Redirigiendo a la página de nueva contraseña...</p>
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
              ¿Recordaste tu contraseña?{" "}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
