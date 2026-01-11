"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, MessageSquare, MapPin } from "lucide-react"
import { UserSelector } from "@/components/user-selector"

export default function SolicitudesAsesorPage() {
  const [activeTab, setActiveTab] = useState("pendientes")

  const solicitudesPendientes = [
    {
      id: 1,
      alumno: "Pedro Gómez",
      universidad: "Universidad Nacional",
      carrera: "Ingeniería de Sistemas",
      materia: "Algoritmos",
      fecha: "2025-01-18",
      hora: "16:00",
      tipo: "Virtual",
      duracion: "1.5 horas",
      precio: 22500,
      mensaje: "Necesito ayuda con árboles binarios de búsqueda y análisis de complejidad.",
      avatar: "/hombre-estudiante.png",
    },
    {
      id: 2,
      alumno: "Ana Torres",
      universidad: "Universidad de los Andes",
      carrera: "Ingeniería de Sistemas",
      materia: "Programación en Java",
      fecha: "2025-01-20",
      hora: "15:00",
      tipo: "Presencial",
      duracion: "2 horas",
      precio: 30000,
      mensaje: "Tengo dudas sobre herencia y polimorfismo en Java.",
      avatar: "/mujer-estudiante.png",
    },
    {
      id: 3,
      alumno: "Carlos Méndez",
      universidad: "Universidad Javeriana",
      carrera: "Ingeniería de Sistemas",
      materia: "Estructuras de Datos",
      fecha: "2025-01-22",
      hora: "10:00",
      tipo: "Virtual",
      duracion: "1 hora",
      precio: 15000,
      mensaje: "Necesito repasar listas enlazadas y pilas.",
      avatar: "/hombre-estudiante.png",
    },
  ]

  const solicitudesAceptadas = [
    {
      id: 4,
      alumno: "Juan Díaz",
      materia: "Programación en Java",
      fecha: "2025-01-15",
      hora: "14:00",
      tipo: "Virtual",
      precio: 20000,
      avatar: "/abstract-geometric-shapes.png",
      estado: "confirmada",
    },
  ]

  const solicitudesRechazadas = [
    {
      id: 5,
      alumno: "Laura Sánchez",
      materia: "Base de Datos",
      fecha: "2025-01-10",
      hora: "18:00",
      tipo: "Presencial",
      motivoRechazo: "No disponible en ese horario",
      avatar: "/portrait-of-a-woman.png",
    },
  ]

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitudes de Asesoría</h1>
            <p className="text-gray-600">Administra las solicitudes de tus estudiantes</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pendientes" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pendientes
                <Badge className="ml-1 bg-red-600 text-white">{solicitudesPendientes.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="aceptadas" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Aceptadas
              </TabsTrigger>
              <TabsTrigger value="rechazadas" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rechazadas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pendientes">
              <div className="space-y-4">
                {solicitudesPendientes.map((solicitud) => (
                  <Card key={solicitud.id} className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={solicitud.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {solicitud.alumno
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{solicitud.alumno}</h3>
                            <p className="text-sm text-gray-600">{solicitud.universidad}</p>
                            <p className="text-xs text-gray-500">{solicitud.carrera}</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pendiente</Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-900">Materia:</span>
                            <span className="text-gray-600">{solicitud.materia}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{solicitud.fecha}</span>
                            <Clock className="h-4 w-4 text-gray-400 ml-2" />
                            <span className="text-gray-600">{solicitud.hora}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <Badge variant="secondary">{solicitud.tipo}</Badge>
                            <span className="text-gray-600">• {solicitud.duracion}</span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between">
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Pago estimado</p>
                            <p className="text-2xl font-bold text-green-600">${solicitud.precio.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">Mensaje del estudiante:</p>
                        <p className="text-sm text-gray-700">{solicitud.mensaje}</p>
                      </div>

                      <div className="flex gap-3">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aceptar Solicitud
                        </Button>
                        <Button variant="outline" className="flex-1 border-gray-300 bg-transparent">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contactar
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="aceptadas">
              <div className="space-y-4">
                {solicitudesAceptadas.map((solicitud) => (
                  <Card key={solicitud.id} className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={solicitud.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-red-100 text-red-600">
                              {solicitud.alumno
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{solicitud.alumno}</h4>
                            <p className="text-sm text-gray-600">{solicitud.materia}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {solicitud.fecha} • {solicitud.hora}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {solicitud.tipo}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-100 text-green-700 border-green-300">Confirmada</Badge>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">${solicitud.precio.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rechazadas">
              <div className="space-y-4">
                {solicitudesRechazadas.map((solicitud) => (
                  <Card key={solicitud.id} className="border-gray-200 bg-gray-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 grayscale">
                            <AvatarImage src={solicitud.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gray-200 text-gray-600">
                              {solicitud.alumno
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{solicitud.alumno}</h4>
                            <p className="text-sm text-gray-600">{solicitud.materia}</p>
                            <p className="text-xs text-gray-500 mt-1">Motivo: {solicitud.motivoRechazo}</p>
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-red-300">Rechazada</Badge>
                      </div>
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
