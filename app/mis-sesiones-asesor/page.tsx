"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Star, DollarSign, ArrowLeft, MessageSquare, CheckCircle } from "lucide-react"
import { UserSelector } from "@/components/user-selector"

export default function MisSesionesAsesorPage() {
  const [activeTab, setActiveTab] = useState("proximas")

  const proximasSesiones = [
    {
      id: 1,
      alumno: "Juan Díaz",
      materia: "Programación en Java",
      fecha: "2025-01-15",
      hora: "14:00 - 15:30",
      tipo: "Virtual",
      duracion: "1.5 hrs",
      precio: 22500,
      avatar: "/abstract-geometric-shapes.png",
      enlace: "https://meet.google.com/abc-defg-hij",
    },
    {
      id: 2,
      alumno: "María Rodríguez",
      materia: "Estructuras de Datos",
      fecha: "2025-01-15",
      hora: "17:00 - 19:00",
      tipo: "Presencial",
      duracion: "2 hrs",
      precio: 30000,
      avatar: "/portrait-thoughtful-woman.png",
      ubicacion: "Biblioteca Central, Sala 301",
    },
    {
      id: 3,
      alumno: "Carlos Méndez",
      materia: "Algoritmos",
      fecha: "2025-01-16",
      hora: "10:00 - 11:00",
      tipo: "Virtual",
      duracion: "1 hr",
      precio: 15000,
      avatar: "/hombre-estudiante.png",
      enlace: "https://meet.google.com/xyz-abcd-efg",
    },
  ]

  const sesionesCompletadas = [
    {
      id: 4,
      alumno: "Ana Torres",
      materia: "Programación en Java",
      fecha: "2025-01-10",
      duracion: "2 hrs",
      precio: 30000,
      avatar: "/mujer-estudiante.png",
      calificacion: 5,
      comentario: "Excelente explicación, muy claro y paciente.",
    },
    {
      id: 5,
      alumno: "Pedro Gómez",
      materia: "Estructuras de Datos",
      fecha: "2025-01-08",
      duracion: "1.5 hrs",
      precio: 22500,
      avatar: "/hombre-estudiante.png",
      calificacion: 5,
      comentario: "Muy buen asesor, resolvió todas mis dudas.",
    },
  ]

  const gananciasEsteMes =
    proximasSesiones.reduce((sum, s) => sum + s.precio, 0) + sesionesCompletadas.reduce((sum, s) => sum + s.precio, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild size="sm">
                <Link href="/dashboard-asesor">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Univyy</span>
              </div>
            </div>
            <UserSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Sesiones</h1>
            <p className="text-gray-600">Administra tus asesorías y ganancias</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Ganancias Este Mes</p>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${gananciasEsteMes.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Sesiones Este Mes</p>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {proximasSesiones.length + sesionesCompletadas.length}
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Calificación Promedio</p>
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">4.9</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="proximas" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próximas
                <Badge className="ml-1 bg-blue-600 text-white">{proximasSesiones.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completadas" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completadas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="proximas">
              <div className="space-y-4">
                {proximasSesiones.map((sesion) => (
                  <Card key={sesion.id} className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {sesion.alumno
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{sesion.alumno}</h3>
                            <p className="text-sm text-gray-600">{sesion.materia}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {sesion.fecha}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {sesion.hora}
                              </span>
                              <Badge variant="secondary">{sesion.tipo}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Pago</p>
                          <p className="text-2xl font-bold text-green-600">${sesion.precio.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{sesion.duracion}</p>
                        </div>
                      </div>

                      {sesion.tipo === "Virtual" && sesion.enlace && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-blue-900 mb-2">Enlace de reunión:</p>
                          <a
                            href={sesion.enlace}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                          >
                            {sesion.enlace}
                          </a>
                        </div>
                      )}

                      {sesion.tipo === "Presencial" && sesion.ubicacion && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-gray-900 mb-1">Ubicación:</p>
                          <p className="text-sm text-gray-700">{sesion.ubicacion}</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button asChild className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                          <Link href={`/sesion/${sesion.id}`}>Ver Detalles</Link>
                        </Button>
                        <Button variant="outline" className="border-gray-300 bg-transparent">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contactar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completadas">
              <div className="space-y-4">
                {sesionesCompletadas.map((sesion) => (
                  <Card key={sesion.id} className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={sesion.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {sesion.alumno
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{sesion.alumno}</h4>
                            <p className="text-sm text-gray-600">{sesion.materia}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {sesion.fecha} • {sesion.duracion}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">${sesion.precio.toLocaleString()}</p>
                          <Badge className="mt-1 bg-green-100 text-green-700 border-green-300">Completada</Badge>
                        </div>
                      </div>

                      {sesion.calificacion && (
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-medium text-gray-900">Calificación:</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < sesion.calificacion ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {sesion.comentario && <p className="text-sm text-gray-700 italic">"{sesion.comentario}"</p>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
