"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function RegistroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipoInicial = searchParams.get("tipo") || "alumno"

  const [tipo, setTipo] = useState<"alumno" | "asesor">(tipoInicial as "alumno" | "asesor")
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [universidad, setUniversidad] = useState("")
  const [carrera, setCarrera] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/auth/callback`,
        data: {
          nombre,
          tipo,
          universidad,
          carrera,
        },
      },
    })

    setIsLoading(false)

    if (signUpError) {
      if (signUpError.message.includes("User already registered")) {
        setError("Este correo ya está registrado. Intenta iniciar sesión.")
      } else {
        setError(signUpError.message)
      }
      return
    }

    if (data.user) {
      // Redirect to success page
      router.push("/registro/exito")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
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
            <CardTitle className="text-2xl text-center text-gray-900">Crear Cuenta</CardTitle>
            <CardDescription className="text-center text-gray-600">Únete a la comunidad de Univvy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-gray-900">Tipo de Usuario</Label>
                <RadioGroup
                  value={tipo}
                  onValueChange={(value) => setTipo(value as "alumno" | "asesor")}
                  className="grid grid-cols-2 gap-4"
                  disabled={isLoading}
                >
                  <div>
                    <RadioGroupItem value="alumno" id="alumno" className="peer sr-only" />
                    <Label
                      htmlFor="alumno"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-50 cursor-pointer transition-all"
                    >
                      <span className="text-sm font-semibold text-gray-900">Alumno</span>
                      <span className="text-xs text-gray-600">Busco asesoría</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="asesor" id="asesor" className="peer sr-only" />
                    <Label
                      htmlFor="asesor"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-red-600 peer-data-[state=checked]:bg-red-50 cursor-pointer transition-all"
                    >
                      <span className="text-sm font-semibold text-gray-900">Asesor</span>
                      <span className="text-xs text-gray-600">Ofrezco asesoría</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Personal Information */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-gray-900">
                  Nombre Completo
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">
                  Correo Universitario
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
                <p className="text-xs text-gray-500">Usa tu correo institucional para verificación</p>
              </div>

              {/* Academic Information */}
              <div className="space-y-2">
                <Label htmlFor="universidad" className="text-gray-900">
                  Universidad
                </Label>
                <Input
                  id="universidad"
                  type="text"
                  placeholder="Universidad Nacional de Colombia"
                  value={universidad}
                  onChange={(e) => setUniversidad(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carrera" className="text-gray-900">
                  Carrera
                </Label>
                <Input
                  id="carrera"
                  type="text"
                  placeholder="Ingeniería de Sistemas"
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-gray-300"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900">
                  Contraseña
                </Label>
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
                <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900">
                  Confirmar Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Al registrarte, aceptas nuestros{" "}
                <Link href="/terminos" className="text-red-600 hover:text-red-700">
                  Términos de Uso
                </Link>{" "}
                y{" "}
                <Link href="/privacidad" className="text-red-600 hover:text-red-700">
                  Política de Privacidad
                </Link>
              </p>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-medium">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
