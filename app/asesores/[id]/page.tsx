"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  BookOpen,
  MessageSquare,
  Calendar,
  GraduationCap,
  Award,
  CheckCircle2,
  Loader2,
  UserX,
} from "lucide-react"
import { useAsesor } from "@/hooks/use-asesores"

export default function AsesorProfilePage() {
  const params = useParams<{ id: string }>()
  const { asesor, loading, error } = useAsesor(params.id || "")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <Link href="/asesores" className="flex items-center gap-2 text-gray-700 hover:text-red-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a Asesores</span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
            <p className="text-gray-600">Cargando perfil del asesor...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !asesor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <Link href="/asesores" className="flex items-center gap-2 text-gray-700 hover:text-red-600">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a Asesores</span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <UserX className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Asesor no encontrado</h3>
              <p className="text-gray-600 text-center max-w-md mb-4">
                El asesor que buscas no existe o no está disponible en este momento.
              </p>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/asesores">Ver todos los asesores</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/asesores" className="flex items-center gap-2 text-gray-700 hover:text-red-600">
            <ArrowLeft className="h-5 w-5" />
            <span>Volver a Asesores</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Advisor Profile Card */}
            <Card className="border-gray-200">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={asesor.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-red-100 text-red-600 text-3xl">
                      {asesor.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{asesor.nombre}</h1>
                        <p className="text-lg text-gray-600 mb-3">{asesor.carrera}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-lg font-semibold text-gray-900">{asesor.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-600">({asesor.sesiones_completadas} sesiones completadas)</span>
                        </div>
                      </div>
                    </div>

                    {asesor.especialidades.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {asesor.especialidades.map((esp, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm">
                            {esp}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{asesor.universidad}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{asesor.disponibilidad || "Disponibilidad flexible"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span>{asesor.modalidad.length > 0 ? asesor.modalidad.join(", ") : "Virtual"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <GraduationCap className="h-5 w-5 text-red-600" />
                  Sobre mí
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {asesor.descripcion || "Este asesor aún no ha agregado una descripción."}
                </p>
              </CardContent>
            </Card>

            {/* Methodology */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Award className="h-5 w-5 text-red-600" />
                  Metodología de Enseñanza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Metodología personalizada adaptada a las necesidades de cada estudiante.
                </p>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Star className="h-5 w-5 text-red-600" />
                  Reseñas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Star className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-600">
                    Este asesor aún no tiene reseñas. ¡Sé el primero en dejar una!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div>
            <Card className="border-gray-200 sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${asesor.precio_por_hora.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-600">/hora</span>
                  </div>
                  <p className="text-sm text-gray-600">Primera sesión con descuento del 20%</p>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
                    <Link href={`/agendar/${asesor.id}`}>
                      <Calendar className="mr-2 h-5 w-5" />
                      Reservar Sesión
                    </Link>
                  </Button>

                  <Button variant="outline" className="w-full border-gray-300 bg-transparent" size="lg">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Enviar Mensaje
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">¿Qué incluye?</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Sesión personalizada uno a uno</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Material de apoyo incluido</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Seguimiento post-sesión</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Garantía de satisfacción</span>
                    </li>
                  </ul>
                </div>

                <Separator className="my-6" />

                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 text-center">
                    <span className="font-semibold">Responde en promedio:</span> menos de 2 horas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
