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
} from "lucide-react"

export default function AsesorProfilePage() {
  const params = useParams<{ id: string }>()

  // Mock data - in real app this would fetch from API
  const asesor = {
    id: Number.parseInt(params.id || "1"),
    nombre: "Ana Martínez",
    especialidades: ["Álgebra Lineal", "Cálculo Multivariable", "Geometría Analítica"],
    universidad: "Universidad Nacional",
    carrera: "Matemáticas",
    semestre: "9no semestre",
    rating: 4.9,
    sesiones: 120,
    precio: 15000,
    modalidad: ["Virtual", "Presencial"],
    disponibilidad: "Lunes a Viernes",
    descripcion:
      "Soy estudiante de último semestre de Matemáticas con gran pasión por la enseñanza. He trabajado como tutora durante los últimos 3 años ayudando a estudiantes de diferentes carreras a comprender conceptos matemáticos complejos de manera simple y práctica.",
    experiencia: [
      "3 años de experiencia como tutora privada",
      "Monitora académica de Cálculo en la Universidad Nacional",
      "Ganadora del premio a mejor estudiante de Matemáticas 2023",
    ],
    metodologia:
      "Mi método de enseñanza se basa en identificar las necesidades específicas de cada estudiante y adaptar las explicaciones a su estilo de aprendizaje. Utilizo ejemplos prácticos y ejercicios progresivos para asegurar una comprensión sólida.",
    avatar: "/ana-abstract-geometric.png",
    reviews: [
      {
        id: 1,
        nombre: "Carlos Mendoza",
        rating: 5,
        comentario: "Excelente asesora, muy paciente y clara en sus explicaciones. Me ayudó mucho con Álgebra Lineal.",
        fecha: "Hace 1 semana",
      },
      {
        id: 2,
        nombre: "Laura Gómez",
        rating: 5,
        comentario: "Ana tiene un don para enseñar. Logré entender temas que había estado luchando por meses.",
        fecha: "Hace 2 semanas",
      },
      {
        id: 3,
        nombre: "Diego Ruiz",
        rating: 4,
        comentario: "Muy buena experiencia. Recomendada al 100%.",
        fecha: "Hace 1 mes",
      },
    ],
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
                    <AvatarImage src={asesor.avatar || "/placeholder.svg"} />
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
                        <p className="text-lg text-gray-600 mb-3">
                          {asesor.carrera} • {asesor.semestre}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-lg font-semibold text-gray-900">{asesor.rating}</span>
                          </div>
                          <span className="text-gray-600">({asesor.sesiones} sesiones completadas)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {asesor.especialidades.map((esp, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {esp}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{asesor.universidad}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{asesor.disponibilidad}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span>{asesor.modalidad.join(", ")}</span>
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
                <p className="text-gray-700 leading-relaxed mb-6">{asesor.descripcion}</p>

                <h4 className="font-semibold text-gray-900 mb-3">Experiencia y logros</h4>
                <ul className="space-y-2">
                  {asesor.experiencia.map((exp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
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
                <p className="text-gray-700 leading-relaxed">{asesor.metodologia}</p>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Star className="h-5 w-5 text-red-600" />
                  Reseñas ({asesor.reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {asesor.reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gray-200 text-gray-700">
                            {review.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{review.nombre}</h4>
                            <span className="text-xs text-gray-500">{review.fecha}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comentario}</p>
                        </div>
                      </div>
                      <Separator className="mt-6" />
                    </div>
                  ))}
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
                    <span className="text-4xl font-bold text-gray-900">${asesor.precio.toLocaleString()}</span>
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
